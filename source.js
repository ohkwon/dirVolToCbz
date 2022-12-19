const file_system = require('fs');
const archiver = require('archiver');
// const prompt = require('prompt-sync')();
const deasync = require('deasync');

const zipCurrDir = (dir, vol, run) => {
    console.log(`Starting zipping process for directory: ${dir}${vol}`);
    console.log(`run: ${run}`)
    if (! run) {
        return;
    }
    const outputFileDirName = dir + vol;
    const sourceFileDirName = dir + vol;
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

const zipCurrDirDeasync = deasync((dir, vol, run, cb) => {
    try {
        zipCurrDir(dir, vol, run);
    } catch (error) {
        cb(error, null);
    }
    cb(null, true);
});

const exceptions = []

const dirCrawler = (baseDir, level = 0, run = false) => {
    const readingDir = baseDir;
    const dirents = file_system.readdirSync(readingDir, {withFileTypes: true});
    dirents.forEach(dirent => {
        const res = `${readingDir}${dirent.name}`;
        if (level == 0) {
            dirCrawler(baseDir + dirent.name + '\\', 1, run);
        } else {
            var volName = dirent.name;
            // console.log(`baseDir: ${baseDir} - name: ${dirAppend} - fileName: ${volName}`);
            const volNumBeg = volName.indexOf('第');
            const volNumEnd = volName.indexOf('巻');
            if (volNumBeg >= 0 & volNumEnd >= 0  & ((volNumEnd - volNumBeg) == 3)) {
                volName = `第${volName.substring(volNumBeg + 1, volNumEnd)}巻`;
            } else {
                console.log(`Exception found for ${baseDir}${volName}`);
                exceptions.push(`${baseDir}${volName}`);
            }
            zipCurrDirDeasync(baseDir, volName, run);
        }
    });
    if (level == 0) {
        console.log('EXCEPTIONS');
        console.log(exceptions);
    }
}

const processParams = () => {
    if (process.argv.length < 2) {
        console.log('No valid input returned.');
        return;
    }

    const funcName = process.argv[2];
    switch(funcName) {
        case 'zipCurrDir':
            const dir = 'C:\\Users\\zacho\\OneDrive\\Documents\\MangaCopy\\EX-ARM エクスアーム\\';
            const vol = '第03巻';
            console.log(`Processing coded values of dir: ${dir}${vol}`);
            var run = false;
            if (process.argv.length == 4 & process.argv[3] == 'run=true') {
                run = true;
            }
            console.log('Converting specified store' + (run ? '' : ' as test'));
            zipCurrDir(dir, vol, run);
            break;
        case 'convertWholeDir':
            if (process.argv.length < 4) {
                console.log('Error please provide root directory of entire comic store.');
            } else {
                const baseDir = process.argv[3];
                var run = false;
                if (process.argv.length == 5 & process.argv[4] == 'run=true') {
                    run = true;
                }
                console.log('Converting whole store' + (run ? '' : ' as test'));
                dirCrawler(baseDir, 0, run);
            }
            break;
        default:
            console.log('No valid function name passed.');
    }
}

// zipCurrDir('C:\\Users\\zacho\\OneDrive\\Documents\\MangaCopy\\', 'EX-ARM エクスアーム', '03');
// dirCrawler('C:\\Users\\zacho\\OneDrive\\Documents\\MangaCopy\\');
processParams();
