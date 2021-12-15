
module.exports = {
  
    attributes: {  	

        addedBy:{
	       model:'users'
	    },

        // prospecteId:{
        //     model:'Prospectes'
        // },       

        isFavourite: {
            type: 'Boolean',
            defaultsTo: true
        },

        createdAt: {
            type: 'ref',
            autoCreatedAt: true
          },
    
          updatedAt: {
            type: 'ref',
            autoUpdatedAt: true
          },
     
  }
};