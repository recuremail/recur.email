const honeypot = require('project-honeypot')('yuixmesfzopq');

export async function queryHoneypotIP(ip: string) {
  return new Promise(
    (resolve, reject) => {
      honeypot.query(ip, function(err, result) {
        if(err) {
          return reject(err);
        }
        resolve(result);
      })
      
    }
  );
}