import fs = require('fs');
for (var i = 0; i < 100; i++)
    fs.appendFile('message.txt', 'data to append' + '\n', (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });