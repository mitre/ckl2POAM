// This converts https://csrc.nist.gov/csrc/media/projects/forum/documents/stig-mapping-to-nist-800-53.xlsx exported to CSV to JSON, keyed by the CCI ID.
const Papa = require('papaparse')
const fs = require('fs')
const path = require('path')



fs.readFile(path.join(__dirname, 'cci2nist.csv'), 'utf8', function (readFileError, data) {
    Papa.parse(data, {
        complete: function(results) {
            const mapper = {}
            results.data.forEach((item) => {
                const cci = item[1]
                const nist = item[8]
                if(!(cci in mapper)){
                    mapper[cci] = nist
                }
            })
            fs.writeFileSync('cci2nist.json', JSON.stringify(mapper));
        }
    });
})

