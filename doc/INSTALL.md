1. git clone https://github.com/restorecommerce/cli.git to Y
2. npm install inside Y
3. npm install in Y/lib/oss-client and Y/lib/gss-client
3. Go to Y/node_modules
4. npm link /Invend/int_modules/restore-server-bootstrap
5. Go to /Invend/apps/egbooking-bootstrap-demo/node_modules 
6. npm link Y
7. Go to /Invend/apps/egbooking-bootstrap-demo

Use:
node node_modules/restore-cli/lib/cli/index.js (with or without DEBUG='rstc:*')

Setup:

node node_modules/restore-cli/lib/cli/index.js project init --id egbooking-bootstrap-demo --entry bookingdemo.restorecommerce.io --apikey *********PASTE API KEY HERE *********


node node_modules/restore-cli/lib/cli/index.js bootstrap --project egbooking-bootstrap-demo
node node_modules/restore-cli/lib/cli/index.js gss --project egbooking-bootstrap-demo import

