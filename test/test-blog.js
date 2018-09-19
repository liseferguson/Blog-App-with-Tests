'use strict';


const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module

const expect = chai.expect;
//Q: why does this fail when I use the config-test endpoint instead?
const { BlogPost } = require('../models');
const {app, runServer, closeServer} = require('../server');
const {DATABASE_URL} = require('../config');

chai.use(chaiHttp);


function seedBlogData() {
  console.info('seeding blog data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogData());
  }

  // this will return a promise
  return BlogPost.insertMany(seedData);
}

function generateBlogData() {
  return {
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    title: faker.lorem.words(),
    content: faker.lorem.paragraphs(),
  };
}


// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
  //does this need a promoise like in the solution?
}

describe('Blog posts API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  //describe('GET endpoint', function() {

    it('should return all existing blog posts', function() {
      // strategy:
      //    1. get back all restaurants returned by by GET request to `/restaurants`
      //    2. prove res has right status, data type
      //    3. prove the number of restaurants we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
   
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          // so subsequent .then blocks can access response object
         // res = _res 
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.be.at.least(1);
        });
    });

    it('deletes a blog post by id', function() {


      return BlogPost
        .findOne()
        .then(function(blogpost) {
          console.log(`BlogPost ID = `+blogpost.id);
          return chai.request(app).delete(`/posts/${blogpost.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(BlogPost.id);
        })
        .then(function(BlogPost) {
          expect(BlogPost).to.be.null;
        });
      });
  
    it('should add a new blog post', function() {

      const newBlogPost = generateBlogData();
      

     return chai.request(app)

        .post('/posts')
        .send(newBlogPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'author', 'title', 'content');
          expect(res.body.name).to.equal(newBlogPost.name);
          // cause Mongo should have created id on insertion
          expect(res.body.id).to.not.be.null;
          //taking id returned in response and find in database, will feed function below
          console.log(`result ID =` + res.body.id);
          return BlogPost.findById(res.body.id);

      })

        .then(function(BlogPost) {
          expect(BlogPost.author.firstName).to.equal(newBlogPost.author.firstName);
          expect(BlogPost.author.lastName).to.equal(newBlogPost.author.lastName);
          expect(BlogPost.title).to.equal(newBlogPost.title);
          expect(BlogPost.content).to.equal(newBlogPost.content);
        });
    });

    it('should update fields you send over', function() {
      const updateData = {
        title: `10 things -- you won't believe #4`,
        author: {
          firstName: 'Lise',
          lastName: 'Ferguson'
        },
        content:'This is the new content'
      };

      return BlogPost
        .findOne()
        .then(function(BlogPost) {
          updateData.id = BlogPost.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/posts/${BlogPost.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return BlogPost.findById(updateData.id);
        })
        .then(function(BlogPost) {
          expect(BlogPost.id).to.equal(updateData.id);
          expect(BlogPost.content).to.equal(updateData.content);
        });
    });

  }); //END OF DESCRIBE
