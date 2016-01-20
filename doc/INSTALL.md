1. git clone https://github.com/restorecommerce/cli.git to Y
2. npm install inside Y
3. Go to Y/node_modules
4. npm link /Invend/int_modules/restore-server-bootstrap
5. Go to /Invend/apps/egbooking-bootstrap-demo/node_modules 
6. npm link Y
7. Go to /Invend/apps/egbooking-bootstrap-demo

Use:
node node_modules/restore-cli/lib/cli/index.js (with or without DEBUG='rstc:*')

