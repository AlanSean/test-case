module.exports = {
    writeHeader : res =>{
        return status =>{
            return param => {
                return data => {
                    res.writeHeader(status,param);
                    res.write(data);
                    res.end();
                }
            }
        }
    },
    fileFactory:(url) =>{
        if(url.indexOf('.html') == -1){
            return url+='/index.html';
        }
    }
}
