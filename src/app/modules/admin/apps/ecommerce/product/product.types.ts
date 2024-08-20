export interface ProductProduct {
    id: string;
    category?: string;
    name: string;
    description?: string;
    tags?: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    vendor: string | null;
    stock: number;
    reserved: number;
    cost: number;
    basePrice: number;
    taxPercent: number;
    price: number;
    weight: number;
    thumbnail: string;
    images: string[];
    active: boolean;
}

export interface ProductPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface ProductCategory {
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface ProductBrand {
    id: string;
    name: string;
    slug: string;
}

export interface ProductTag {
    id?: string;
    title?: string;
}

export interface ProductVendor {
    id: string;
    name: string;
    slug: string;
}
