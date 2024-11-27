
@json
export class Product {
  constructor(
    public id: string,
    public name: string,
    public category: string,
    public price: f32,
    public description: string,
    public image: string,
    public stars: f32,
    public isStocked: boolean,
  ) {}
}


@json
export class UserProductHistory {
  constructor(
    public userId: string,
    public productHistory: ProductHistoryObject[] = [],
  ) {}
}


@json
export class ProductHistoryObject {
  constructor(
    public productId: string,
    public hoursPlayed: i32,
  ) {}
}


@json
export class ProductSearchObject {
  constructor(
    public product: Product,
    public score: f64,
    public distance: f64,
  ) {}
}


@json
export class ProductSearchResult {
  constructor(
    public collection: string,
    public searchMethod: string,
    public status: string,
    public error: string,
    public searchObjs: ProductSearchObject[] = [],
  ) {}
}


@json
export class CartItem {
  constructor(
    public productId: string,
    public quantity: f64,
  ) {}
}


@json
export class Cart {
  constructor(
    public cartId: string,
    public items: CartItem[] = [],
  ) {}
}


@json
export class consts {
  static readonly productNameCollection: string = "productNames";
  static readonly productDescriptionCollection: string = "productDescriptions";
  static readonly productCategoryCollection: string = "productCategories";
  static readonly productPriceCollection: string = "productPrices";
  static readonly productImageCollection: string = "productImages";
  static readonly productStarCollection: string = "productStars";
  static readonly isProductStockedCollection: string = "isProductStocked";

  static readonly searchMethod: string = "searchMethod1";
  static readonly embeddingModel: string = "minilm";

  static readonly userProductHistories: UserProductHistory[] = [
    new UserProductHistory("platformer guy", [
      new ProductHistoryObject("65", 12),
      new ProductHistoryObject("41", 4),
      new ProductHistoryObject("56", 15),
    ]),
    new UserProductHistory("fps guy", [
      new ProductHistoryObject("91", 57),
      new ProductHistoryObject("48", 23),
      new ProductHistoryObject("9", 7),
    ]),
    new UserProductHistory("horror guy", [
      new ProductHistoryObject("77", 6),
      new ProductHistoryObject("26", 12),
      new ProductHistoryObject("118", 7),
    ]),
    new UserProductHistory("puzzle guy", [
      new ProductHistoryObject("104", 63),
      new ProductHistoryObject("1", 3),
      new ProductHistoryObject("140", 16),
    ]),
    new UserProductHistory("rpg guy", [
      new ProductHistoryObject("4", 130),
      new ProductHistoryObject("134", 23),
      new ProductHistoryObject("97", 63),
    ]),
  ];
}