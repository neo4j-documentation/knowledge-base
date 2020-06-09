# gem install ascii_press
# gem install neo4j-core

require 'ascii_press'
require 'neo4j-core'

session = Neo4j::Session.open(:server_db, 'http://localhost:7474', basic_auth: { username: 'neo4j', password: 'test'})

statement = """
  MERGE (a:Author {name:{author}})
  MERGE (p:Article {title:{title}}) ON CREATE SET p.docdate = {docdate}, p.versions = {versions}
  MERGE (a)-[:WROTE]->(p)
  FOREACH (t in {tags} | MERGE (tag:Tag {name:t}) MERGE (p)-[:TAGGED]->(tag) )
  """

renderer = AsciiPress::Renderer.new({:asciidoc_options=>{}})

puts "title\ttags\tauthor\tdocdate\tneo4j-versions"
ARGV.each do |file|
  r = renderer.render(file)
  doc = r.doc
  puts "#{doc.doctitle}\t#{r.tags.join(',')}\t#{r.data[:author]}\t#{r.data[:docdate]}\t#{r.data['neo4j-versions'.to_sym]}"
  
  inserted = session.query(statement, author: r.data[:author], title:doc.doctitle, docdate:r.data[:docdate],versions: r.data['neo4j-versions'.to_sym], tags: r.tags)
  puts inserted
end