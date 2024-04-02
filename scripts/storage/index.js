const _ = require('lodash');

const postData = require('./posts.json')
var slugify = require('slugify')
function convertToBlocks(html) {
    // Define a regular expression pattern to match the desired elements and comments
    const pattern = /<!--([\s\S]*?)-->|<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/g;

    // Initialize an array to store the blocks
    const blocks = [];

    // Iterate over matches in the HTML
    let match;
    while ((match = pattern.exec(html)) !== null) {
        if (match[1]) {
            // Handle comments
            const comment = match[1].trim();
            blocks.push({ type: 'comment', text: comment });
        } else {
            // Extract the text content from the matched elements
            const title = match[2];
            const text = match[3];

            // Create a block object and push it to the blocks array
            blocks.push({ type: 'paragraph', title: title.trim(), text: text.trim() });
        }
    }

    return blocks;
}


const getPostData = () => {
    const data = postData.channel.item.map((item, i) => {
        return {

            createdAt: new Date(item?.pubDate) || new Date(),
            publishedAt: new Date(item?.pubDate) || new Date(),
            title: item?.title,
            categories:item?.category,
            content: convertToBlocks(item?.encoded[0]?.__cdata),
            author: slugify(postData?.channel?.author?.author_login?.__cdata, {
                replacement: '-',  // replace spaces with replacement character, defaults to `-`
                remove: undefined, // remove characters that match regex, defaults to `undefined`
                lower: true,      // convert to lower case, defaults to `false`
                strict: true,     // strip special characters except replacement, defaults to `false`
                locale: 'vi',      // language code of the locale to use
                trim: true         // trim leading and trailing replacement chars, defaults to `true`
            }),
            slug: slugify(item?.title + "-" + i, {
                replacement: '-',  // replace spaces with replacement character, defaults to `-`
                remove: undefined, // remove characters that match regex, defaults to `undefined`
                lower: true,      // convert to lower case, defaults to `false`
                strict: true,     // strip special characters except replacement, defaults to `false`
                locale: 'vi',      // language code of the locale to use
                trim: true         // trim leading and trailing replacement chars, defaults to `true`
            }),
        }
    })

    return data
}

const getCategoriesData = ()=>{
    let categories = []

    for (let item of postData.channel.item) {
        categories.push(item.category)
    }

   return _.uniq(categories.flat(Infinity))
}

module.exports = {
    getPostData,
    getCategoriesData
}