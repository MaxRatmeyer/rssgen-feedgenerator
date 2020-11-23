const axios = require('axios');
const DOMParser = require('xmldom').DOMParser;

const XMLSerializer = require('xmldom').XMLSerializer;
const serializer = new XMLSerializer();

const appHeaders = {
  "access-control-allow-origin": "*",
  "max-is-amazing": "Bigly"
}

module.exports.main = async event => {
  // No parameters sent or the parameter URL does not exist
  if (event.queryStringParameters === null || event.queryStringParameters === undefined) {
    return {
      statusCode: 404,
      headers: appHeaders,
      body: JSON.stringify({
        message: "Parameter 'url' does not exist."
      })
    };
  }

  if (event.queryStringParameters.url === undefined) {
    return {
      statusCode: 404,
      headers: appHeaders,
      body: JSON.stringify({
        message: "Parameter 'url' does not exist."
      })
    };
  }

  const feedURL = event.queryStringParameters.url
  const searchCategories = event.multiValueQueryStringParameters.categories

  console.log("Received request for feed URL '" + feedURL + "'")

  const feedResponse = await axios.get(feedURL).catch(function (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.headers);

      return {
        statusCode: 404,
        headers: appHeaders,
        body: JSON.stringify({
          message: "URL doesn't exist."
        })
      };
    }
  });;

  let parsedFeed = new DOMParser().parseFromString(feedResponse.data);

  let categories = parsedFeed.documentElement.getElementsByTagName('category', 'application/xml');

  for (category in categories) {
    var categoryObject = categories[category];
    if (categoryObject.firstChild && categoryObject.firstChild.nodeValue !== null) {
      var categoryValue = categoryObject.firstChild.nodeValue;

      for (let searchCategory of searchCategories) {
        if (categoryValue.toUpperCase() === searchCategory.toUpperCase()) {
          var categoryParent = categoryObject.parentNode
          categoryParent.parentNode.removeChild(categoryParent);
        }
      }
    }
  }

  return {
    statusCode: 200,
    headers: {
      "access-control-allow-origin": "*",
      "max-is-amazing": "Bigly",
      'content-type': 'application/xml;'
    },
    body: serializer.serializeToString(parsedFeed)
  }
}