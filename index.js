//Intializing the application
const express = require('express');
const axios = require('axios');
const lodash = require('lodash');
const memoize = require('lodash/memoize');
var app = express();

//accessing the environment variables
require('dotenv').config()
const apiURL = process.env.API_URL;
const adminSecret = process.env.API_ADMIN_SECRET;

//start the application
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//Retrieve the data
let blogData = [];
app.get('/api/blog-stats', async (req, res) => {
    try {
        const response = await axios.get(apiURL, {
            headers: { 'x-hasura-admin-secret': adminSecret }
        });
        blogData = response.data.blogs;

        //Total no.of blogs fetched
        const total_blogs_fetched = blogData.length;
        console.log("total number of blogs:", total_blogs_fetched);

        //blog with the longest title.
        const longest_title_blog = lodash.maxBy(blogData, 'title.length');
        const longest_title_blog_title = longest_title_blog.title;
        console.log("Longest title:", longest_title_blog_title);

        // Number of blogs with "privacy" in the title.
        const privacy_in_title = blogData.filter((blog) => (blog['title'].toLowerCase().includes('privacy'))).length;
        console.log("No.of Titles with privacy in it:", privacy_in_title);

        //An array of unique blog titles
        const unique_blog_titles = lodash.uniq(lodash.map(blogData, 'title'));
        console.log("unique Blog Titles:", unique_blog_titles);

    } catch (error) {
        console.error(error.message);
    }
})

//Create an additional route at `/api/blog-search`.
app.get('/api/blog-search', async (req, res) => {
    try {
        const response = await axios.get(apiURL, {
            headers: { 'x-hasura-admin-secret': adminSecret }
        });
        blogData = response.data.blogs;

        //search functionality that filters the blogs based on the provided query string (case-insensitive)

        //route should accept a query parameter
        const query_searched = req.query.query;
        if (!query_searched) {
            return res.status(400).json({ error: 'Missing query parameter' });
        }

        const filtered_blogData = blogData.filter((blog) =>
            blog.title.toLowerCase().includes(query_searched.toLowerCase())
        );
        const query_required_titles = filtered_blogData.map((blog) => blog.title);
        console.log(`Sort results for "${query_searched}":`, query_required_titles);

    } catch (error) {
        console.error(error.message);
    }
});

