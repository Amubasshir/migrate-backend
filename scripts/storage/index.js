const _ = require('lodash');
const cheerio = require('cheerio');

const postData = require('./posts.json')
var slugify = require('slugify')

function convertToStrapiRichText(html) {
    const $ = cheerio.load(html);

    // Initialize an array to store rich text blocks
    const blocks = [];

    // Iterate over each paragraph element
    $('p').each((index, element) => {
        const textContent = $(element).text().trim();
        if (textContent) {
            const block = {
                type: 'paragraph',
                data: {
                    text: textContent
                }
            };
            blocks.push(block);
        }
    });

    return blocks;
}

function convertToBlocks(html) {
    // Load HTML string into Cheerio
    const $ = cheerio.load(html);

    // Remove style tags and their content
    $('style').remove();

    // Get the sanitized HTML string
    const sanitizedHTML = $.html();
    return sanitizedHTML
}




const getPostData = () => {
    const data = postData.channel.item.map((item, i) => {
        console.log(convertToBlocks(item?.encoded[0]?.__cdata))
        return {
            createdAt: new Date(item?.pubDate) || new Date(),
            publishedAt: new Date(item?.pubDate) || new Date(),
            title: item?.title,
            categories: item?.category,
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

const getCategoriesData = () => {
    let categories = []

    for (let item of postData.channel.item) {
        categories.push(item.category)
    }

    return _.uniqBy(categories.flat(Infinity), (item) => `${item?._domain || ""}-${item?._nicename || ""}-${item?.__cdata || ""}`)
}
const getUserNameData = () => {
    return {
        username: slugify(postData?.channel?.author?.author_login?.__cdata, {
            replacement: '-',  // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true,      // convert to lower case, defaults to `false`
            strict: true,     // strip special characters except replacement, defaults to `false`
            locale: 'vi',      // language code of the locale to use
            trim: true         // trim leading and trailing replacement chars, defaults to `true`
        }),
        email: postData?.channel?.author?.author_email?.__cdata
    }
}
module.exports = {
    getPostData,
    getCategoriesData,
    getUserNameData,
}