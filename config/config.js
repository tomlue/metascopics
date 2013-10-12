module.exports = {
	development: {
		db: 'mongodb://localhost/metascopics',
		app: { name: 'metascopics' }
	},
  	production: {
    	db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL,
		app: { name: 'metascopics' }		
 	}
}
