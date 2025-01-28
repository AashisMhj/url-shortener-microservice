// const dns = require('dns');
import dns from 'dns';

export const isValidURL = (url)=> new Promise((resolve, reject) => {
    const loc = new URL(url);
    dns.lookup(loc.host, (error, address, family)=>{
        if(error){
            console.log(error);
            resolve(false);
        } else {
            console.log(`The ip address is ${address} and the ip version is ${family}`)
            resolve(true);
        }
    })
    
})