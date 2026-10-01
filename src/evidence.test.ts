import { describe, it, expect } from 'vitest';
import { BASIS, STRICT, evOf, problems } from './evidence.js';
describe('strict IF evidence contract',()=>{
  const source={title:'Civil instrument',publisher:'NASA',url:'https://science.nasa.gov/',kind:'primary',accessed:'10/01/2026',dated:'Undated'};
  const claim={basis:'spec',ev:{refs:[['civil','Instrument specification table']]}};
  it('preserves the public basis labels and tuple shape',()=>{expect(STRICT).toBe(true);expect(['spec','vendor','reported','derived','assumed'].map(k=>BASIS[k as keyof typeof BASIS].short)).toEqual(['Spec','Vendor','Reported','Calc.','Assumed']);expect(evOf(['Civil temperature','43 K','spec',claim.ev])).toEqual(claim.ev);});
  it('rejects unsupported figures and unchecked sources even with access dates',()=>{expect(problems(claim,{civil:source})).toEqual([]);expect(problems(claim,{civil:{...source,unchecked:'403 Forbidden'}})).not.toEqual([]);expect(problems({basis:'reported',ev:null},{})).not.toEqual([]);expect(problems({basis:'spec',ev:{refs:[['civil','']]}},{civil:source})).not.toEqual([]);expect(problems({basis:'derived',ev:{calc:'missing'}},{})).not.toEqual([]);});
  it('requires primary specifications and attributed vendor comparisons',()=>{expect(problems(claim,{civil:{...source,kind:'secondary'}})).not.toEqual([]);expect(problems({...claim,basis:'vendor'},{civil:source})).not.toEqual([]);});
  it('rejects pointer status, incomplete metadata and malformed references',()=>{expect(problems(claim,{civil:{...source,status:'unchecked'}})).not.toEqual([]);expect(problems(claim,{civil:{...source,url:''}})).not.toEqual([]);expect(problems({basis:'reported',ev:{refs:['civil']}},{civil:source})).not.toEqual([]);});
});
