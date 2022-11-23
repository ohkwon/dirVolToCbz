var file_system = require('fs');
var archiver = require('archiver');
const zipCurrDir = (dir, name, vol) => {
    console.log('Starting zipping process for directory: ' + dir + ' for name: ' + name + ' and vol: ' + vol);
    
    var outputFileDirName = name + '/' + name + ' 第' + vol + '巻.zip'
    var output = file_system.createWriteStream(outputFileDirName);
    var archive = archiver('zip');
    
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('Archiver has been finalized and the output file descriptor has closed.');
    });
    
    archive.on('error', function(err){
        throw err;
    });
    
    archive.pipe(output);
    
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(dir, false);
    
    // append files from a sub-directory and naming it `new-subdir` within the archive
    // archive.directory('subdir/', 'new-subdir');
    
    archive.finalize();
}

zipCurrDir('C:\\Users\\O\'Hoon\\Documents\\JellyfinLibraries\\Comic\\Manga\\SPY×FAMILY\\第01巻', 'SPY×FAMILY', '01');