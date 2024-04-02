'use strict';

const { getPostData, getCategoriesData, getUserNameData } = require('./../scripts/storage/index.js');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      // Create categories if they don't exist
      const existCat = await strapi.db.query('api::category.category').findOne({});
      if (!existCat?.id) {
        for (let cat of getCategoriesData()) {
          const created = await strapi.db.query('api::category.category').create({
            data: {
              "_domain": cat?._domain || null,
              "_nicename": cat?._nicename || null,
              "__cdata": cat?.__cdata || null,
              published_at: new Date(),
            }
          });
        }
      }

      const allCategory = await strapi.db.query('api::category.category').findMany({})
      const existPost = await strapi.db.query('api::post.post').findOne({});
      let existingUser = null;
      try {
        // Check if the user exists
        existingUser = await strapi.plugins['users-permissions'].services.user.fetch({});
      
        // If the user doesn't exist, create a new one
        if (!existingUser) {
          existingUser = await strapi.plugins['users-permissions'].services.user.add({
            username: getUserNameData().username,
            email: getUserNameData().email,
            password: getUserNameData().username, // Note: This should typically be a hashed password
            blocked: false,
            confirmed: true,
            displayName: getUserNameData().username,
          });
          console.log('User created:', existingUser);
        } else {
          console.log('User already exists:', existingUser);
        }
      } catch (error) {
          // Handle errors
          console.error('Error:', error);
        }
        

      if (!existPost?.id) {
        for (let postCreateData of getPostData()) {
          const created = await strapi.db.query('api::post.post').create({
            data: {
              ...postCreateData,
              published_at: new Date(),
              author: existingUser?.id,
              categories: (Array.isArray(allCategory) ? allCategory.filter(item => {
                return Array.isArray(postCreateData?.categories) ? postCreateData?.categories.some((matchCat) => {
                  if (matchCat?._domain == item?._domain && matchCat?._nicename == item?._nicename && matchCat?.__cdata == item?.__cdata) {
                    return true
                  } else {
                    false
                  }
                }) : []
              }) : []).map(item => item?.id),
            }
          });
        
        }
      } else {

      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }
};
