for f in *.adoc; do
    d=$(grep slug "$f" | sed 's/.* //g').adoc
    # echo "$f -> $d"
    if [ ! -f "$d" ]; then
        mv "$f" "$d"
    else
        echo "File '$d' already exists! Skiped '$f'"
    fi
done
