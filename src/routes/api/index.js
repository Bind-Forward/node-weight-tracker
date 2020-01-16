"use strict";

const boom = require( "@hapi/boom" );
const joi = require( "@hapi/joi" );

const register = async ( server ) => {
	// get all measurements for a user
	server.route( {
		method: "GET",
		path: "/api/measurements",
		handler: async ( request, h ) => {
			try {
				const userId = "1234";
				const measurements = await h.sql`SELECT 
					id
					, measure_date AS "measureDate"
					, weight
				 FROM	measurements
				 WHERE	user_id = ${ userId }
				 ORDER BY measure_date`;
				return measurements;
			} catch ( err ) {
				console.log( err );
				return boom.serverUnavailable();
			}
		}
	} );

	// Get one measurement
	server.route( {
		method: "GET",
		path: "/api/measurements/{id}",
		handler: async ( request, h ) => {
			try {
				const userId = "1234";
				const id = request.params.id;
				const res = await h.sql`SELECT 
					id
					, measure_date AS "measureDate"
					, weight
				 FROM measurements 
				 WHERE	user_id = ${ userId }
				   AND	id = ${ id }`;
				return res.count > 0 ? res[0] : boom.notFound();
			} catch ( err ) {
				console.log( err );
				return boom.serverUnavailable();
			}
		},
		options: {
			validate: {
				params: joi.object( {
					id: joi.number().integer().message( "id parameter must be number" )
				} )
			}
		}
	} );

	// Create a new measurement
	server.route( {
		method: "POST",
		path: "/api/measurements",
		handler: async ( request, h ) => {
			try {
				const userId = "1234";
				const { measureDate, weight } = request.payload;
				const res = await h.sql`INSERT INTO measurements 
						( user_id, measure_date, weight )
					VALUES
						( ${ userId }, ${ measureDate }, ${ weight } )

					RETURNING
						id
						, measure_date AS "measureDate"
						, weight`;
				return res.count > 0 ? res[0] : boom.badRequest();
			} catch ( err ) {
				console.log( err );
				return boom.serverUnavailable();
			}
		},
		options: {
			validate: {
				payload: joi.object( {
					measureDate: joi.date(),
					weight: joi.number()
				} )
			}
		}
	} );

	// update
	server.route( {
		method: "PUT",
		path: "/api/measurements/{id}",
		handler: async ( request, h ) => {
			try {
				const userId = "1234";
				const id = request.params.id;
				const { measureDate, weight } = request.payload;
				const res = await h.sql`UPDATE measurements 
				SET	measure_date = ${ measureDate }
					, weight = ${ weight }
				WHERE	id = ${ id }
				  AND	user_id = ${ userId }
				
				RETURNING 
				  id
				  , measure_date AS "measureDate"
				  , weight`;
				return res.count > 0 ? res[0] : boom.notFound();
			}
			catch( err ) {
				console.log( err );
				return boom.serverUnavailable();
			}
		},
		options: {
			validate: {
				params: joi.object( {
					id: joi.number().integer()
				} ),
				payload: joi.object( {
					measureDate: joi.date(),
					weight: joi.number()
				} )
			}
		}
	} );

	// Delete a measurement
	server.route( {
		method: "DELETE",
		path: "/api/measurements/{id}",
		handler: async ( request, h ) => {
			try {
				const userId = "1234";
				const id = request.params.id;
				const res = await h.sql`DELETE 
				FROM 	measurements 
				WHERE	id = ${ id }
				  AND	user_id = ${ userId }`;
				return res.count > 0 ? h.response().code( 204 ) : boom.notFound();
			}
			catch( err ) {
				console.log( err );
				return boom.serverUnavailable();
			}
		},
		options: {
			validate: {
				params: joi.object( {
					id: joi.number().integer()
				} )
			}
		}
	} );
};

module.exports = { register };