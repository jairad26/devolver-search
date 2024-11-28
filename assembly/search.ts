import { models, collections, vectors } from "@hypermode/modus-sdk-as";
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings";
import { getProduct, getUserProductHistory } from "./crud";
import { ProductSearchResult, ProductSearchObject, consts } from "./types";

export function recommendProductByUserHistory(
  userId: string,
  maxItems: i32,
): ProductSearchResult {
  const userHistory = getUserProductHistory(userId);

  const historyVectors: f32[][] = [];

  for (let i = 0; i < userHistory.productHistory.length; i++) {
    const vec = collections.getVector(
      consts.productDescriptionCollection,
      consts.searchMethod,
      userHistory.productHistory[i].productId,
    );
    for (let j = 0; j < vec.length; j++) {
      vec[j] *= f32(userHistory.productHistory[i].hoursPlayed);
    }

    historyVectors.push(vec);
  }

  const sumVec: f32[] = [];
  for (let i = 0; i < historyVectors[0].length; i++) {
    sumVec[i] = 0.0;
    for (let j = 0; j < historyVectors.length; j++) {
      sumVec[i] += historyVectors[j][i];
    }
  }

  const normalizedVec = normalize(sumVec);

  const productSearchRes = new ProductSearchResult(
    consts.productDescriptionCollection,
    consts.searchMethod,
    "success",
    "",
  );

  const historyIds = userHistory.productHistory.map<string>((x) => x.productId);

  const semanticSearchRes = collections.searchByVector(
    consts.productDescriptionCollection,
    consts.searchMethod,
    normalizedVec,
    maxItems + historyIds.length,
  );

  if (!semanticSearchRes.isSuccessful) {
    productSearchRes.status = semanticSearchRes.status;
    productSearchRes.error = semanticSearchRes.error;

    return productSearchRes;
  }

  for (let i = 0; i < semanticSearchRes.objects.length; i++) {
    if (historyIds.includes(semanticSearchRes.objects[i].key)) {
      continue;
    }
    const searchObj = getSearchObject(
      semanticSearchRes.objects[i].key,
      semanticSearchRes.objects[i].score,
      semanticSearchRes.objects[i].distance,
    );
    productSearchRes.searchObjs.push(searchObj);
  }

  // only return the top maxItems
  productSearchRes.searchObjs = productSearchRes.searchObjs.slice(0, maxItems);

  return productSearchRes;
}

// Function to calculate the magnitude of a vector
function magnitude(vec: f32[]): f32 {
  let sum: f32 = 0.0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return f32(Math.sqrt(sum));
}

// Function to normalize a vector
function normalize(vec: f32[]): f32[] {
  const mag = magnitude(vec);
  if (mag == 0) {
    throw new Error("Cannot normalize a zero vector");
  }

  const normalizedVec: f32[] = [];
  for (let i = 0; i < vec.length; i++) {
    normalizedVec.push(vec[i] / mag);
  }

  return normalizedVec;
}

export function searchProducts(
  query: string,
  maxItems: i32,
  // thresholdStars: f32 = 0.0,
): ProductSearchResult {
  const productSearchRes = new ProductSearchResult(
    consts.productDescriptionCollection,
    consts.searchMethod,
    "success",
    "",
  );

  const semanticSearchRes = collections.search(
    consts.productDescriptionCollection,
    consts.searchMethod,
    query,
    maxItems,
    true,
  );

  if (!semanticSearchRes.isSuccessful) {
    productSearchRes.status = semanticSearchRes.status;
    productSearchRes.error = semanticSearchRes.error;

    return productSearchRes;
  }

  // const rankedResults = reRankAndFilterSearchResultObjects(
  //   semanticSearchRes.objects,
  //   thresholdStars,
  // );

  const rankedResults = semanticSearchRes.objects;

  for (let i = 0; i < rankedResults.length; i++) {
    const searchObj = getSearchObject(
      rankedResults[i].key,
      rankedResults[i].score,
      rankedResults[i].distance,
    );
    productSearchRes.searchObjs.push(searchObj);
  }

  return productSearchRes;
}

function getSearchObject(
  key: string,
  score: f64,
  distance: f64,
): ProductSearchObject {
  return new ProductSearchObject(getProduct(key), score, distance);
}

// function reRankAndFilterSearchResultObjects(
//   objs: collections.CollectionSearchResultObject[],
//   thresholdStars: f32,
// ): collections.CollectionSearchResultObject[] {
//   for (let i = 0; i < objs.length; i++) {
//     const starRes = collections.getText(
//       consts.productStarCollection,
//       objs[i].key,
//     );
//     const stars = parseFloat(starRes);

//     const inStockRes = collections.getText(
//       consts.isProductStockedCollection,
//       objs[i].key,
//     );
//     const inStock = inStockRes === "true";

//     //stock is not a factor in ranking
//     if (!inStock) {
//       objs[i].score *= 1;
//     }
//     objs[i].score *= stars * 1;
//   }

//   objs.sort((a, b) => {
//     if (a.score < b.score) {
//       return -1;
//     } else if (a.score > b.score) {
//       return 1;
//     } else {
//       return 0;
//     }
//   });

//   const filteredResults: collections.CollectionSearchResultObject[] = [];
//   for (let i = 0; i < objs.length; i++) {
//     const starRes = collections.getText(
//       consts.productStarCollection,
//       objs[i].key,
//     );
//     const stars = parseFloat(starRes);
//     if (stars >= thresholdStars) {
//       filteredResults.push(objs[i]);
//     }
//   }

//   return filteredResults;
// }

export function miniLMEmbed(texts: string[]): f32[][] {
  const model = models.getModel<EmbeddingsModel>(consts.embeddingModel);
  const input = model.createInput(texts);
  const output = model.invoke(input);

  return output.predictions;
}