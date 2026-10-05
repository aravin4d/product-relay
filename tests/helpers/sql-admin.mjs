// Test adapter only: actual application SQL, with no claim of PostgREST compatibility.
const ident=s=>{if(!/^[a-z_][a-z0-9_]*$/.test(s))throw new Error('Unsafe test identifier');return '"'+s+'"';};
const parameter=v=>v&&typeof v==='object'&&!Array.isArray(v)?JSON.stringify(v):v;
export function sqlAdmin(db){
 return {rpc:async(name,args={})=>{try{const entries=Object.entries(args),meta=(await db.query('select proretset from pg_proc where proname=$1',[name])).rows[0];const call='public.'+ident(name)+'('+entries.map(([k],i)=>ident(k)+' => $'+(i+1)).join(',')+')';const result=await db.query(meta.proretset?'select * from '+call:'select '+call+' as result',entries.map(([,v])=>parameter(v)));return {data:meta.proretset?result.rows:result.rows[0].result,error:null};}catch(error){return {data:null,error};}},from:table=>new Query(db,table)};
}
class Query{
 constructor(db,table){this.db=db;this.table=table;this.mode='select';this.columns='*';this.filters=[];this.orders=[];this.values=[];this.returnRows=false;}
 select(columns='*'){this.columns=columns;this.returnRows=true;return this;}
 insert(value){this.mode='insert';this.record=value;return this;}
 update(value){this.mode='update';this.record=value;return this;}
 upsert(value,options={}){this.mode='upsert';this.record=value;this.options=options;return this;}
 eq(column,value){this.filters.push(ident(column)+' = '+this.param(value));return this;}
 in(column,values){this.filters.push(ident(column)+' = any('+this.param(values)+')');return this;}
 not(column,operator,value){if(operator!=='is'||value!==null)throw new Error('Unsupported test operator');this.filters.push(ident(column)+' is not null');return this;}
 order(column,{ascending=true}={}){this.orders.push(ident(column)+(ascending?' asc':' desc'));return this;}
 limit(value){this.max=value;return this;}
 single(){this.one='required';return this;}
 maybeSingle(){this.one='optional';return this;}
 param(value){this.values.push(parameter(value));return '$'+this.values.length;}
 then(resolve,reject){return this.execute().then(resolve,reject);}
 async execute(){try{const table='public.'+ident(this.table),columns=this.columns==='*'?'*':this.columns.split(',').map(ident).join(',');let sql;
  if(this.mode==='select')sql='select '+columns+' from '+table;
  else if(this.mode==='update')sql='update '+table+' set '+Object.entries(this.record).map(([k,v])=>ident(k)+'='+this.param(v)).join(',');
  else {const entries=Object.entries(this.record);sql='insert into '+table+' ('+entries.map(([k])=>ident(k)).join(',')+') values ('+entries.map(([,v])=>this.param(v)).join(',')+')';if(this.mode==='upsert'){let keys=this.options.onConflict?.split(',');if(!keys)keys=(await this.db.query('select a.attname from pg_index i join pg_attribute a on a.attrelid=i.indrelid and a.attnum=any(i.indkey) where i.indrelid=$1::regclass and i.indisprimary',[table])).rows.map(r=>r.attname);sql+=' on conflict ('+keys.map(ident).join(',')+') '+(this.options.ignoreDuplicates?'do nothing':'do update set '+entries.filter(([k])=>!keys.includes(k)).map(([k])=>ident(k)+'=excluded.'+ident(k)).join(','));}}
  if(this.filters.length)sql+=' where '+this.filters.join(' and ');if(this.orders.length)sql+=' order by '+this.orders.join(',');if(this.max!==undefined)sql+=' limit '+Number(this.max);if(this.mode!=='select'&&this.returnRows)sql+=' returning '+columns;
  const result=await this.db.query(sql,this.values);if(this.one==='required'&&result.rows.length!==1)throw new Error('Expected one test row');if(this.one&&result.rows.length>1)throw new Error('Expected at most one test row');return {data:this.one?result.rows[0]??null:result.rows,error:null};
 }catch(error){return {data:null,error};}}
}
