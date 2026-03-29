const fs = require('fs');
const readline = require('readline');

const csvPath = '../notebook/final_processed_data.csv';
const outputClusterPath = './public/data/salary_by_cluster.json';
const outputIssuePath = './public/data/salary_by_issue.json';

// Helper to quickly compute box plot stats
function computeBoxPlotStats(valuesArray) {
    if (valuesArray.length === 0) return null;
    valuesArray.sort((a, b) => a - b);
    
    // We reverse natural log (Math.exp) to get actual Salary amounts instead of base-logs
    const expVals = valuesArray.map(v => Math.exp(v));
    
    const min = expVals[0];
    const max = expVals[expVals.length - 1];
    
    const q1 = expVals[Math.floor(expVals.length * 0.25)];
    const median = expVals[Math.floor(expVals.length * 0.5)];
    const q3 = expVals[Math.floor(expVals.length * 0.75)];
    
    return {
        min: min,
        q1: q1,
        median: median,
        q3: q3,
        max: max
    };
}

async function processFile() {
    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let isHeader = true;
    let headers = [];
    
    const clusters = {};
    const issues = {};

    for await (const line of rl) {
        if (isHeader) {
            headers = line.split(',');
            isHeader = false;
            continue;
        }

        // CSV Splitting avoiding commas in quotes
        const cols = [];
        let currStr = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuotes = !inQuotes;
            } else if (line[i] === ',' && !inQuotes) {
                cols.push(currStr);
                currStr = '';
            } else {
                currStr += line[i];
            }
        }
        cols.push(currStr); // last col

        const logSalaryIdx = headers.indexOf('log_salary');
        const clusterIdx = headers.indexOf('cluster_label');
        const issueIdx = headers.indexOf('critical_issue');

        const logSalaryStr = cols[logSalaryIdx];
        const cluster = cols[clusterIdx];
        
        // Clean critical issue (just take the primary one if it's a comma separated string)
        let issueRaw = cols[issueIdx];
        if (issueRaw) {
           issueRaw = issueRaw.replace(/"/g, '').split(',')[0].trim();
        }
        
        if (logSalaryStr && !isNaN(parseFloat(logSalaryStr)) && parseFloat(logSalaryStr) > 0) {
            const val = parseFloat(logSalaryStr);
            
            if (cluster) {
                if (!clusters[cluster]) clusters[cluster] = [];
                clusters[cluster].push(val);
            }
            
            if (issueRaw && issueRaw !== 'Unknown') {
                if (!issues[issueRaw]) issues[issueRaw] = [];
                issues[issueRaw].push(val);
            }
        }
    }

    const clusterData = Object.keys(clusters).map(key => ({
        group: key,
        ...computeBoxPlotStats(clusters[key])
    })).filter(d => d.median);

    const issueData = Object.keys(issues).map(key => ({
        group: key,
        ...computeBoxPlotStats(issues[key])
    })).filter(d => d.median);

    fs.writeFileSync(outputClusterPath, JSON.stringify(clusterData, null, 2));
    fs.writeFileSync(outputIssuePath, JSON.stringify(issueData, null, 2));
    console.log("Generated BoxPlot datasets!");
}

processFile().catch(console.error);
