'use strict';

console.log('Loading function');
const _ = require('lodash');
const lodashId = require('lodash-id');
const low = require('lowdb');

const db = low();
db._.mixin(lodashId);
 
const uuid = require('uuid');

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a lowdb table, make a GET request with the doc as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * lowdb API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'DELETE':
            remove(event.queryStringParameters, done);
            break;
        case 'GET':
            search(event.queryStringParameters , done);
            break;
        case 'POST':
            insert( event.body, done);
            break;
        case 'PUT':
            update(event.body, done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }


};

const search = ( query, done )=>{
        console.log(' query => ', query)
        if (query && query.doc){
            
            let  rep = null ;
            if(db.has(query.doc).value()){   
                if (query.id )
                   rep = db.get(query.doc).getById(query.id).value();
                else 
                   rep = db.get(query.doc).value();
            }

            done( null, rep);
        }
        else 
            done( null, null);
    };

const insert = ( body, done ) => {

    if (typeof(body)==='string')
        body = JSON.parse(body);

    if (body && body.doc){     

        if(!db.has(body.doc).value()){
            db.set(body.doc, []) .write();
        }

        let  _id = db.get(body.doc).insert(body.data).write().id;
        let rep = db.get(body.doc).getById(_id).value();

        console.log(' rep => ' , typeof(rep), ' ',  rep);
        done(null, rep);
    }
    else{
        done( {message: "doc is missing"});
    }
};

const update = ( body, done ) => {

    
    if (typeof(body)==='string')
        body = JSON.parse(body);

    if (body && body.doc){     

        if(db.has(body.doc).value()){
            
            db.get(body.doc)
                .getById(body.data.id)
                .assign(body.data).write();
                        
            let rep = db.get(body.doc).getById(body.data.id).value();
        
            done(null, rep);
        }
        else {
            done({message: "doc doesn't exits"});
        }
    }
    else{
        done( {message: "doc is missing"});
    }
};

const remove = ( query, done )=>{
    console.log(' query => ', query)
    if (query && query.doc){

        if(db.has(query.doc).value()){   
            if (query.id )
               db.get(query.doc).remove(query.id).write();
        }
        done( null, true);
    }
    else 
        done( null, null);
};


