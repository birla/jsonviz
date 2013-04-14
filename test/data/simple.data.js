/**
 * PATHS
 */
var data_simple_paths_set_1 = [
  "$['store']['book'][0][1]",
  "$..['book'][*]",
  "$[*][*][*]['value'][0]"
];

var data_simple_paths_set_2 = [
  "$['store'][1,2][0][1:3]",
  "$..[(@.length-1)][*]",
  "$..[*][?(@.value>10)]['value']"
];

var data_simple_paths_set_3 = [
  "$..['book'][:2]",
  "$..['book'][0,1]",
  "$..['book'][-1:]",
];

/**
 * TABLES
 */

var data_simple_table_4 = [{
  "category": "reference",
  "author": "Nigel Rees",
  "title": "Sayings of the Century",
  "isbn": "0-395-44235-8",
  "price": 8.95
},
{
  "category": "fiction",
  "author": "Evelyn Waugh",
  "title": "Sword of Honour",
  "isbn": "0-395-14569-1",
  "price": 12.99
},
{
  "category": "fiction",
  "author": "Herman Melville",
  "title": "Moby Dick",
  "isbn": "0-553-21311-3",
  "price": 8.99
},
{
  "category": "fiction",
  "author": "J. R. R. Tolkien",
  "title": "The Lord of the Rings",
  "isbn": "0-395-19395-8",
  "price": 22.99
}];

var data_simple_table_10 = [{
  "category": "reference",
  "author": "Nigel Rees",
  "title": "Sayings of the Century",
  "isbn": "0-395-44235-8",
  "price": 8.95
},
{
  "category": "fiction",
  "author": "Evelyn Waugh",
  "title": "Sword of Honour",
  "isbn": "0-395-14569-1",
  "price": 12.99
},
{
  "category": "fiction",
  "author": "Herman Melville",
  "title": "Moby Dick",
  "isbn": "0-553-21311-3",
  "price": 8.99
},
{
  "category": "fiction",
  "author": "J. R. R. Tolkien",
  "title": "The Lord of the Rings",
  "isbn": "0-395-19395-8",
  "price": 22.99
},
{
  "category": "reference",
  "author": "Nigel Rees",
  "title": "Sayings of the Century",
  "isbn": "0-395-44235-8",
  "price": 8.95
},
{
  "category": "fiction",
  "author": "Evelyn Waugh",
  "title": "Sword of Honour",
  "isbn": "0-395-14569-1",
  "price": 12.99
},
{
  "category": "fiction",
  "author": "Herman Melville",
  "title": "Moby Dick",
  "isbn": "0-553-21311-3",
  "price": 8.99
},
{
  "category": "fiction",
  "author": "J. R. R. Tolkien",
  "title": "The Lord of the Rings",
  "isbn": "0-395-19395-8",
  "price": 22.99
},
{
  "category": "reference",
  "author": "Nigel Rees",
  "title": "Sayings of the Century",
  "isbn": "0-395-44235-8",
  "price": 8.95
},
{
  "category": "fiction",
  "author": "J. R. R. Tolkien",
  "title": "The Lord of the Rings",
  "isbn": "0-395-19395-8",
  "price": 22.99
}];

var data_simple_table_10_ds = [
  "category",
  "author",
  "title",
  "isbn",
  "price"
];
