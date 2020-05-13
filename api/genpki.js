/**
 * Script generates OpenSSL PKI based on the configuration in config.yml
 */

var log         = require('fancy-log');
var fse         = require('fs-extra');
var yaml        = require('js-yaml');
var exec        = require('child_process').exec;
var execSync    = require('child_process').execSync;

// Absolute pki base dir
const pkidir = __dirname + '/data/' + 'mypki/';



var PKIExists = function() {
        fse.ensureDir(pkidir);

        if(fse.existsSync(pkidir + 'created')) {
            return true;
        } else {
            return false;
        }
};


var createFileStructure = function() {
    log(">>> Creating CA file structure")

    return new Promise(function(resolve, reject) {
        fse.ensureDirSync(pkidir);

        /*
         * Prepare root/ dir
         */

        fse.ensureDirSync(pkidir + 'root');

        fse.ensureDirSync(pkidir + 'root/certs');
        fse.ensureDirSync(pkidir + 'root/crl');

        fse.writeFileSync(pkidir + 'root/index.txt', '', 'utf8');
        fse.writeFileSync(pkidir + 'root/serial', '1000', 'utf8');

        // Customize openssl.cnf and copy to root/

        openssl_root = fse.readFileSync(__dirname + '/pkitemplate/openssl_root.cnf.tpl', 'utf8');
        openssl_root = openssl_root.replace(/{basedir}/g, pkidir + 'root');
        openssl_root = openssl_root.replace(/{days}/g, global.config.ca.root.days);
        openssl_root = openssl_root.replace(/{country}/g, global.config.ca.root.country);
        openssl_root = openssl_root.replace(/{state}/g, global.config.ca.root.state);
        openssl_root = openssl_root.replace(/{locality}/g, global.config.ca.root.locality);
        openssl_root = openssl_root.replace(/{organization}/g, global.config.ca.root.organization);
        openssl_root = openssl_root.replace(/{commonname}/g, global.config.ca.root.commonname);

        fse.writeFileSync(pkidir + 'root/openssl.cnf', openssl_root);

        /*
         * Prepare intermediate/ dir
         */

        fse.ensureDirSync(pkidir + 'intermediate');

        fse.ensureDirSync(pkidir + 'intermediate/certs');
        fse.ensureDirSync(pkidir + 'intermediate/crl');

        fse.writeFileSync(pkidir + 'intermediate/index.txt', '', 'utf8');
        fse.writeFileSync(pkidir + 'intermediate/serial', '1000', 'utf8');
        fse.writeFileSync(pkidir + 'intermediate/crlnumber', '1000', 'utf8');

        // Customize openssl.cnf and copy to root/

        openssl_intermediate = fse.readFileSync(__dirname + '/pkitemplate/openssl_intermediate.cnf.tpl', 'utf8');
        openssl_intermediate = openssl_intermediate.replace(/{basedir}/g, pkidir + 'intermediate');
        openssl_intermediate = openssl_intermediate.replace(/{days}/g, global.config.ca.intermediate.days);
        openssl_intermediate = openssl_intermediate.replace(/{country}/g, global.config.ca.intermediate.country);
        openssl_intermediate = openssl_intermediate.replace(/{state}/g, global.config.ca.intermediate.state);
        openssl_intermediate = openssl_intermediate.replace(/{locality}/g, global.config.ca.intermediate.locality);
        openssl_intermediate = openssl_intermediate.replace(/{organization}/g, global.config.ca.intermediate.organization);
        openssl_intermediate = openssl_intermediate.replace(/{commonname}/g, global.config.ca.intermediate.commonname);
        openssl_intermediate = openssl_intermediate.replace(/{ocspurl}/g, global.config.ca.intermediate.ocsp.url);
        openssl_intermediate = openssl_intermediate.replace(/{crlurl}/g, global.config.ca.intermediate.crl.url);

        fse.writeFileSync(pkidir + 'intermediate/openssl.cnf', openssl_intermediate);

        /*
         * Prepare intermediate/ocsp dir
         */
        fse.ensureDirSync(pkidir + 'intermediate/ocsp');
        openssl_intermediate_ocsp = fse.readFileSync(__dirname + '/pkitemplate/openssl_ocsp.cnf.tpl', 'utf8');
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{state}/g, global.config.ca.intermediate.state);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{country}/g, global.config.ca.intermediate.country);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{locality}/g, global.config.ca.intermediate.locality);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{organization}/g, global.config.ca.intermediate.organization);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{commonname}/g, global.config.server.ocsp.domain);
        fse.writeFileSync(pkidir + 'intermediate/ocsp/openssl.cnf', openssl_intermediate_ocsp);


        /*
         * Prepare apicert configuration
         */
        fse.ensureDirSync(pkidir + 'apicert');
        openssl_apicert = fse.readFileSync(__dirname + '/pkitemplate/openssl_apicert.cnf.tpl', 'utf8');
        openssl_apicert = openssl_apicert.replace(/{state}/g, global.config.ca.root.state);
        openssl_apicert = openssl_apicert.replace(/{country}/g, global.config.ca.root.country);
        openssl_apicert = openssl_apicert.replace(/{locality}/g, global.config.ca.root.locality);
        openssl_apicert = openssl_apicert.replace(/{organization}/g, global.config.ca.root.organization);
        openssl_apicert = openssl_apicert.replace(/{commonname}/g, global.config.server.http.domain);
        fse.writeFileSync(pkidir + 'apicert/openssl.cnf', openssl_apicert);

        resolve();
    });
};



var createRootCA = function() {
    log(">>> Creating Root CA");

    return new Promise(function(resolve, reject) {
        // Create root key
        log(">>>> Creating Root CA private Key...");
        log(">>>>> 'openssl genrsa -aes256 -out root.key.pem -passout pass:<ROOT_PASSPHRASE> 4096'");
        exec('openssl genrsa -aes256 -out root.key.pem -passout pass:' + global.config.ca.root.passphrase + ' 4096', { cwd: pkidir + 'root' },
            function() {
            // Create Root certificate
            log(">>>>> Creating Root CA public Certificate...");
            log(">>>>>> 'openssl req -config openssl.cnf -key root.key.pem -new -x509 -days <DAYS> -sha256 -extensions v3_ca -out root.cert.pem -passin pass:<ROOT_PASSPHRASE>'");
            exec('openssl req -config openssl.cnf -key root.key.pem -new -x509 -days ' + global.config.ca.root.days + ' -sha256 -extensions v3_ca -out root.cert.pem -passin pass:' + global.config.ca.root.passphrase, { cwd: pkidir + 'root' }, 
                function() {
                    log(">>>>>>> Creating Root CA finished successful");
                    resolve();
                });
        });
    });
};



var createIntermediateCA = function() {
    log(">>> Creating Intermediate CA");

    return new Promise(function(resolve, reject) {
        // Create intermediate key
        log(">>>> Creating Intermediate CA private Key...");
        log(">>>>> 'openssl genrsa -aes256 -out intermediate.key.pem -passout pass:<INTERMEDIATE_PASSPHRASE> 4096'");
        exec('openssl genrsa -aes256 -out intermediate.key.pem -passout pass:' + global.config.ca.intermediate.passphrase + ' 4096', {
            cwd: pkidir + 'intermediate'
        }, function() {
            // Create intermediate certificate request
            log(">>>>> Creating Intermediate CA Certificate Request (CSR)...");
            log(">>>>>> 'openssl req -config openssl.cnf -new -sha256 -key intermediate.key.pem -out intermediate.csr.pem -passin pass:<INTERMEDIATE_PASSPHRASE>'");
            exec('openssl req -config openssl.cnf -new -sha256 -key intermediate.key.pem -out intermediate.csr.pem -passin pass:' + global.config.ca.intermediate.passphrase, {
                cwd: pkidir + 'intermediate'
            }, function() {
                // Create intermediate certificate
                log(">>>>>> Creating Intermediate CA Certificate...");
                log(">>>>>>> 'openssl ca -config ../root/openssl.cnf -extensions v3_intermediate_ca -days <DAYS> -notext -md sha256 -in intermediate.csr.pem -out intermediate.cert.pem -passin pass:<ROOT_PASSPHRASE> -batch'");
                    exec('openssl ca -config ../root/openssl.cnf -extensions v3_intermediate_ca -days ' + global.config.ca.intermediate.days + ' -notext -md sha256 -in intermediate.csr.pem -out intermediate.cert.pem -passin pass:' + global.config.ca.root.passphrase + ' -batch', {
                    cwd: pkidir + 'intermediate'
                }, function() {

                    // Create CA chain file
		        	log(">>> Creating Intermediate CA chain file");
                    
                    // Read intermediate
			        log(">>>> Read Intermediate CA (" + pkidir + "intermediate/intermediate.cert.pem)");
                    intermediateCert = fse.readFileSync(pkidir + 'intermediate/intermediate.cert.pem', 'utf8');
			        log(">>>>> Intermediate CA Certificate read!");
                    
                    // Read root cert
                    log(">>> Reading Root Certificate");
                    rootCert = fse.readFileSync(pkidir + 'root/root.cert.pem', 'utf8');
			        log(">>>>> Root CA Certificate read!");

                    cachain = intermediateCert + '\n\n' + rootCert;
                    log(">>> Write Certificate Chain");
                    fse.writeFileSync(pkidir + 'intermediate/ca-chain.cert.pem', cachain);
			        log(">>>>> Certificate Chain written!");

                    // Remove intermediate.csr.pem file
                    log(">>> remove Intermediate csr.pem file... (" + pkidir + "intermediate/intermediate.csr.pem)");
                    fse.removeSync(pkidir + 'intermediate/intermediate.csr.pem');
                    log(">>>> Intermediate csr.pem file removed!");

                    resolve();
                });
            });
        });
    });
};



var createOCSPKeys = function() {
    log(">>> Creating OCSP Keys")

    return new Promise(function(resolve, reject) {
        // Create key
        exec('openssl genrsa -aes256 -out ocsp.key.pem -passout pass:' + global.config.ca.intermediate.ocsp.passphrase + ' 4096', {
            cwd: pkidir + 'intermediate/ocsp'
        }, function() {
            // Create request
            exec('openssl req -config openssl.cnf -new -sha256 -key ocsp.key.pem -passin pass:' + global.config.ca.intermediate.ocsp.passphrase + ' -out ocsp.csr.pem', {
                cwd: pkidir + 'intermediate/ocsp'
            }, function() {
                // Create certificate
                exec('openssl ca -config ../openssl.cnf -extensions ocsp -days 3650 -notext -md sha256 -in ocsp.csr.pem -out ocsp.cert.pem -passin pass:' + global.config.ca.intermediate.passphrase + ' -batch', {
                    cwd: pkidir + 'intermediate/ocsp'
                }, function() {
                    fse.removeSync(pkidir + 'intermediate/ocsp/ocsp.csr.pem');
                    resolve();
                });
            });
        });
    });
};




/*
 * Creates server certificate pair for HTTP API
 * Directly form Root CA
 */
var createAPICert = function() {
    log(">>> Creating HTTPS API certificates");

    return new Promise(function(resolve, reject) {
        // Create key
        exec('openssl genrsa -out key.pem 4096', {
            cwd: pkidir + 'apicert'
        }, function() {
            // Create request
            exec('openssl req -config openssl.cnf -new -sha256 -key key.pem -out csr.pem', {
                cwd: pkidir + 'apicert'
            }, function() {
                // Create certificate
                exec('openssl ca -config ../root/openssl.cnf -extensions server_cert -days 3650 -notext -md sha256 -in csr.pem -out cert.pem -passin pass:' + global.config.ca.root.passphrase + ' -batch', {
                    cwd: pkidir + 'apicert'
                }, function() {
                    fse.removeSync(pkidir + 'apicert/csr.pem');
                    resolve();
                });
            });
        });
    });
};



/*
 * Sets correct file permissions for CA files
 */
var setFilePerms = function() {
    log(">>> Setting file permissions")

    return new Promise(function(resolve, reject) {
        // Root CA
        fse.chmodSync(pkidir + 'root/root.key.pem', 0400);
        fse.chmodSync(pkidir + 'root/root.cert.pem', 0444);
        fse.chmodSync(pkidir + 'root/openssl.cnf', 0400);

        // Intermediate CA
        fse.chmodSync(pkidir + 'intermediate/intermediate.key.pem', 0400);
        fse.chmodSync(pkidir + 'intermediate/intermediate.cert.pem', 0444);
        fse.chmodSync(pkidir + 'intermediate/openssl.cnf', 0400);

        resolve();
    });
};





module.exports.create = function() {
    return new Promise(function(resolve, reject) {
        createFileStructure().then(function() {
            createRootCA().then(function() {
                createIntermediateCA().then(function() {
                    createOCSPKeys().then(function() {
                        createAPICert().then(function() {
                            setFilePerms().then(function() {
                                log("### Finished!");

                                // Tag mypki as ready.
                                fse.writeFileSync(pkidir + 'created', '', 'utf8');
                                resolve()
                            })
                            .catch(function(err) {
                                reject("Error: " + err)
                            });
                        })
                        .catch(function(err) {
                            reject("Error: " + err)
                        });
                    })
                    .catch(function(err) {
                        reject("Error: " + err)
                    });
                })
                .catch(function(err) {
                    reject("Error: " + err)
                });
            })
            .catch(function(err) {
                reject("Error: " + err)
            })
        })
        .catch(function(err) {
            reject("Error: " + err)
        });
    })
}
