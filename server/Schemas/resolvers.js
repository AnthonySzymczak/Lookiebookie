const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

// refer to module 21 for resolvers.js


const resolvers = {
    //Query Start
  Query: {
    me: async (parent, args, context) => {
      if(context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
      
      return userData;
      }

      throw new AuthenticationError('Not logged in');
    }
  },


//Mutation Start
  Mutation: {
    
        //Add User function
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
      
            return { token, user };
          },
      
//Login function
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
      
      const correctPw = await user.isCorrectPassword(password);
      
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      
      const token = signToken(user);
      return { token, user };
    },




    //Save book , update user with selected book
    // if login is false return error

    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!')
    },

    //Remove book function , isolate user, remove selected book from their saved books
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!')
    } 
  }
};


//Export resolvers
module.exports = resolvers;