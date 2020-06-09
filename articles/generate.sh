#print knowledge base to adoc book

echo '= Knowledge Base' > kb-book.txt
echo ':doctype: book' >> kb-book.txt
echo ':toc: left' >> kb-book.txt
echo ':experimental:' >> kb-book.txt
echo ' ' >> kb-book.txt

for f in *.adoc; do
    d=$(grep slug "$f" | sed 's/.* //g').adoc
        cp "$f" "book/$d"
done

for f in book/*.adoc; do
	echo 'include::'$f'[]' >> kb-book.txt
done

asciidoctor kb-book.txt
asciidoctor-pdf kb-book.txt
open kb-book.pdf
