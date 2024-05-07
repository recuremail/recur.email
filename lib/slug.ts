import voca from 'voca'

import { transliterate } from './transliterate'

let emojilib = require("emojilib")

let nodeslugify = require('slug');
let translitslugify = require('transliteration').slugify;

function slugify(text, options) {
  if (!options) {
    options = {mode: 'pretty', lower: true};
  }
  var slug1 = nodeslugify(text, options),
    slug2 = translitslugify(text);
    
  if (slug1.length > slug2.length) {
    return slug1;
  }
  return slug2;
}

export function makeSlug(inputStr: string) {
  let input = (inputStr || '').trim()
  input = input.replaceAll('#', 'sharp')
  if(emojilib[input] && emojilib[input].length > 0) {
    input = emojilib[input][0]
  }
  let transliteratedInput = transliterate(input)
  // NOTE: this is for chords and C# langauge an so on.
  let slug = transliteratedInput
  slug = voca.slugify(transliteratedInput)
  
  if(slug && slug.trim().length > 0){
    return slug.trim()
  }
  return slugify(input, {}).trim()
}

export function renderEmojis(text: string){
  if(!text) {
    return ''
  }
  const eachEmojiWrapped = voca.replace(text, /\p{Emoji}/ug, function(match: string|undefined) {
    if(!match) {
      return ''
    }
    if(voca.isAlphaDigit(match)) {
      return match
    }
    if(voca.matches(match, /[.,\/#!$%\^&\*;:{}=\-_`~()]/g)) {
      return match
    }
    return `<span class='emoji'>${match}</span>`
  })
  // because some emojis are split into several
  let final = voca.replaceAll(eachEmojiWrapped, `</span><span class='emoji'>`, '') 
  final = voca.replaceAll(final, `</span>\n<span class='emoji'>`, '') 
  return final
}

export function renderTitle(title: string){
  return renderEmojis(title)
}