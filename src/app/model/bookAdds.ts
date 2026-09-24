export class BookAdds {
    id: string='';
    category: Category[]=[];
    bookName: string='';
    boardName: string='';
    boardId: string='';
    className: string='';
    classId: string='';
    publicationName: string='';
    YearOfPublication: string='';
    condition: string='';
    bookPrice: string='';
    discount: string='';
    photos: string[] = [];
    status: string='';
    userid: string='';
    postedDate: string='';
    details: string='';
    description: string='';
    isToggleOn: boolean=false;
    discountPercentage: string='';
    keywords:string[] = [];
}


export class BooksCategory {
    id: string='';
    category: Category[]=[];
}

export class Category {
    name: string='';
    displayName: string='';
}
