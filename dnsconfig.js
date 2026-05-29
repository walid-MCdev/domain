// Initialize Registrars and Providers
var REG_NONE = NewRegistrar('none');
var DSP_CLOUDFLARE = NewDnsProvider('cloudflare');

// Import our custom domain parser utility
var domains = require('./scripts/parse-domains.js');

// Configuration for your Master Apex Domain
D('code-space.me', REG_NONE, DnsProvider(DSP_CLOUDFLARE),
    A('@', '192.0.2.1'),     // Replace with your personal landing page IP
    CNAME('www', '@'),       // Point www to apex

    // Loop through all user-submitted files and inject them into Cloudflare
    domains.map(function(d) {
        var subdomain = d.subdomain;
        var records = d.records;
        var commands = [];

        if (records.CNAME) {
            commands.push(CNAME(subdomain, records.CNAME));
        }
        if (records.A) {
            // If they supplied an array of IPs, bind them all
            if (Array.isArray(records.A)) {
                records.A.forEach(function(ip) {
                    commands.push(A(subdomain, ip));
                });
            } else {
                commands.push(A(subdomain, records.A));
            }
        }
        return commands;
    })
);
