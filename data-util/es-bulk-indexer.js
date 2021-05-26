const fs       = require('fs');
const zlib     = require('zlib');
const readline = require('readline');
const axios    = require('axios');
const exec     = require('child_process').exec;

let inputFile = 'data.gz'
let outputFolder = './output'
let outputPrefix = outputFolder+'/ads-batch'
let esEndpoint = "https://search-kraicklist-prod-es-zt52mtu2umn5qozlmxdadi6osu.me-south-1.es.amazonaws.com"
let index = 'products'
let authHeader = 'Basic ZWxhc3RpYzp6Qzkva0B2ez1jaCU='

let adsCount = 0
let fileCount = 0
let batchUploadSize = 500

async function createMapping() {
    let reqUrl = esEndpoint+'/'+index
    let config = {
        headers: {
            url: reqUrl,
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    }

    let payload = {
        "mappings": {
            "properties": {
              "title": {
                "type": "text"
              },
              "content": {
                "type": "text"
              },
              "tags": {
                "type": "text"
              },
              "updated_at": {
                "type": "date",
                "format": "strict_date_optional_time||epoch_second"
              }
            }
          }
    }

    try {
        await axios.put(reqUrl, payload, config)
        console.log(index+" mapping created")
    } catch(e) {
        if (e.response.code = 400) {
            console.log(index+" index already exist")
        } else {
            throw e
        }
    }
}

function bulkIndex() {

    // clear files inside output folder
    fs.rmdirSync(outputFolder, { recursive: true });
    fs.mkdirSync(outputFolder);

    outputFile = outputPrefix+fileCount+".json"
    let lineReader = readline.createInterface({
        input: fs.createReadStream(inputFile).pipe(zlib.createGunzip())
    });
    
    lineReader.on('line', (line) => {
        payload = JSON.parse(line)
        console.log("Exporting Ads-"+adsCount+". id = "+payload.id+" | title = "+payload.title);
        
        action = {"index":{"_id": payload.id}}
        fs.appendFileSync(outputFile, JSON.stringify(action)+"\n");
        delete payload["id"]
        fs.appendFileSync(outputFile, JSON.stringify(payload)+"\n");
        
        adsCount++
        if(adsCount % batchUploadSize == 0) {
            bulkIndexApiHit(outputFile)

            fileCount++
            outputFile = outputPrefix+fileCount+".json"
        }
    }).on('close', () => {
        if (adsCount % batchUploadSize != 0) {
            bulkIndexApiHit(outputFile)
        }        
        console.log("Read stream closed")
    });
    
    if (adsCount % batchUploadSize != 0) {
        bulkIndexApiHit(outputFile)
    }  
}

function bulkIndexApiHit(filename) {
    console.log("Bulk indexing: "+filename)
    var command = 'curl -s -H "Content-Type: application/x-ndjson" -H '+authHeader
                    +' -XPOST '+esEndpoint+'/'+index+'/_bulk --data-binary "@'+filename+'"'
    
    child = exec(command, function(error){
        if(error !== null) {
            throw error
        }
        console.log("Bulk index finished: "+filename)
    });
}

async function main() {
    
    try {
        // create mapping on ES
        await createMapping()
        // load data from input file into ES
        bulkIndex()
    } catch(e) {
        console.log(e)
    }

}

main()
