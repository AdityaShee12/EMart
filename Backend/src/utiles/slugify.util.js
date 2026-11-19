import slugify from 'slugify';


export const Do_slugify=(text)=>{
    return slugify(text,{
        lower: true,
        strict: true
    })
}