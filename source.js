const file_system = require('fs');
const archiver = require('archiver');
const prompt = require('prompt-sync')();
const zipCurrDir = (dir, name, vol) => {
    console.log(`Starting zipping process for directory: ${dir}${name}\\${vol}`);
    
    const outputFileDirName = dir + name + '\\' + vol;
    const sourceFileDirName = dir + name + '\\' + vol;
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

const exceptions = []

const dirCrawler = (baseDir, dirAppend = '', level = 0) => {
    const readingDir = `${baseDir}\\${dirAppend}`;
    const dirents = file_system.readdirSync(readingDir, {withFileTypes: true});
    dirents.forEach(dirent => {
        const res = `${readingDir}${dirent.name}`;
        if (level == 0) {
            dirCrawler(baseDir, dirent.name, 1);
        } else if (dirAppend) {
            var volName = dirent.name;
            // console.log(`baseDir: ${baseDir} - name: ${dirAppend} - fileName: ${volName}`);
            const volNumBeg = volName.indexOf('第');
            const volNumEnd = volName.indexOf('巻');
            if (volNumBeg >= 0 & volNumEnd >= 0  & ((volNumEnd - volNumBeg) == 3)) {
                volName = `第${volName.substring(volNumBeg + 1, volNumEnd)}巻`;
                // console.log(`Zipping ${baseDir}\\${dirAppend}\\${volName} into  ${baseDir}\\${dirAppend}\\第${volParam}巻`);
            } else {
                // console.log(`Exception found for ${baseDir}\\${dirAppend}\\${volName}`);
                exceptions.push(`${baseDir}\\${dirAppend}\\${volName}`);
            }
            zipCurrDir(baseDir, dirAppend, volName);
        }
    });
    if (level == 0) {
        console.log('EXCEPTIONS');
        console.log(exceptions);
    }
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

// zipCurrDir('C:\\Users\\zacho\\OneDrive\\Documents\\MangaCopy\\', 'EX-ARM エクスアーム', '03');
dirCrawler('C:\\Users\\zacho\\OneDrive\\Documents\\MangaCopy\\');
// processParams();
