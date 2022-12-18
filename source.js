const file_system = require('fs');
const archiver = require('archiver');
const prompt = require('prompt-sync')();
const zipCurrDir = (dir, name, vol) => {
    console.log('Starting zipping process for directory: ' + dir + ' for name: ' + name + ' and vol: ' + vol);
    
    const outputFileName = '第' + vol + '巻';
    const outputFileDirName = dir + name + '\\' + outputFileName;
    const sourceFileDirName = dir + name + '\\' + outputFileName;
    const output = file_system.createWriteStream(outputFileDirName + '.zip');
    const archive = archiver('zip');
    
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('Archiver has been finalized and the output file descriptor has closed.');
    });
    
    archive.on('error', function(err){
        throw err;
    });
    
    archive.pipe(output);
    
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(sourceFileDirName, false);

    archive.finalize().then(() => {
        file_system.renameSync(outputFileDirName + '.zip', outputFileDirName + '.cbz');
    });
}

const processParams = () => {
    console.log(process.argv);
    if (process.argv.length < 2) {
        console.log('No valid input returned.');
        return;
    }

    const funcName = process.argv[2];
    switch(funcName) {
        case 'zipCurrDir':
            const dir = prompt('What is the directory of the volume you are trying to convert to cbz?');
            const name = prompt('What is the name of the series that you are trying to convert to cbz?');
            const vol = prompt('What volume number are you trying to convert to cbz?');
            console.log('Processing dir: ' + dir + ' - name: ' + name + ' - vol: ' + vol);
            zipCurrDir(dir, name, vol);
        default:
            console.log('No valid function name passed.');
    }
}

zipCurrDir('C:\\Users\\zacho\\OneDrive\\Documents\\MangaCopy\\', 'EX-ARM エクスアーム', '03');
// processParams();
