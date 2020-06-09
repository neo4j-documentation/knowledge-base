package example;

import org.junit.Assert;
import org.junit.Test;
import org.neo4j.graphdb.*;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;

import java.io.File;

import static org.neo4j.graphdb.Direction.OUTGOING;

public class CreateDataTest {

    enum Labels implements Label {Person}
    enum Types implements RelationshipType {KNOWS}

    @Test public void createData() {
        GraphDatabaseService db = new GraphDatabaseFactory().newEmbeddedDatabase(new File("target/test.db"));
//tag::create_data[]
        try (Transaction tx = db.beginTx()) {
            Node n = db.createNode(Labels.Person);
            n.setProperty("name", "Emil");
            Node m = db.createNode(Labels.Person);
            m.setProperty("name", "Peter");
            n.createRelationshipTo(m, Types.KNOWS);
            // calling success is important to mark the transaction successful
            tx.success();
        }
//end::create_data[]
        try (Transaction tx = db.beginTx()) {
            Assert.assertNotNull(db.findNode(Labels.Person, "name", "Emil"));
            Assert.assertEquals("Peter", db.findNode(Labels.Person, "name", "Emil")
                    .getSingleRelationship(Types.KNOWS, OUTGOING).getEndNode().getProperty("name"));
        }
        db.shutdown();
    }
}
