//http://zakon1.rada.gov.ua/cgi-bin/laws/main.cgi?nreg=55-2010-%EF
var mapping= {
  'А':'A',
  'а':'a',
  'Б':'B',
  'б':'b',
  'В':'V',
  'в':'v',
  'Г':'H',
  'г':'h',
  'Ґ':'G',
  'ґ':'g',
  'Д':'D',
  'д':'d',
  'Е':'E',
  'е':'e',
  'Є':'Ye',//just on the word beginning
  'є':'ie',
  'Ж':'Zh',
  'ж':'zh',
  'З':'Z',
  'з':'z',
  'И':'Y',
  'и':'y',
  'І':'I',
  'і':'i',
  'Ї':'Yi',//just on the word beginning
  'ї':'i',
  'Й':'Y',//just on the word beginning
  'й':'i',
  'К':'K',
  'к':'k',
  'Л':'L',
  'л':'l',
  'М':'M',
  'м':'m',
  'Н':'N',
  'н':'n',
  'О':'O',
  'о':'o',
  'П':'P',
  'п':'p',
  'Р':'R',
  'р':'r',
  'С':'S',
  'с':'s',
  'Т':'T',
  'т':'t',
  'У':'U',
  'у':'u',
  'Ф':'F',
  'ф':'f',
  'Х':'Kh',
  'х':'kh',
  'Ц':'Ts',
  'ц':'ts',
  'Ч':'Ch',
  'ч':'ch',
  'Ш':'Sh',
  'ш':'sh',
  'Щ':'Shch',
  'щ':'shch',
  'Ю':'Yu',//just on the word beginning
  'ю':'iu',
  'Я':'Ya',//just on the word beginning
  'я':'ia',
  'ь':'',//not transliterated
  "'":''//not transliterated
};
var ZghRegExp = new RegExp('Зг','g'),
  zghRegExp = new RegExp('зг','g');
//ua transliteration global object.
export function transliterate(word: string){
  var i = 0,
      transliterated = '';
  if(word && word.length && word.replace){
      //applying зг-zgh rule
      word = word.replace(ZghRegExp,'Zgh');
      word = word.replace(zghRegExp,'zgh');
      for(; i < word.length; i++){
          var character = word[i],
              // @ts-ignore
              latinCharacter = mapping[character];
          if(latinCharacter || '' === latinCharacter){
              // @ts-ignore
              transliterated += mapping[character];
          }
          else{
              transliterated += character;
          }
      }
  }
  return transliterated;
};