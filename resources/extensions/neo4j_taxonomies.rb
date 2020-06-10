# frozen_string_literal: true

require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'

module Neo4j
  # Asciidoctor extensions by Neo4j
  module AsciidoctorExtensions

    # A tree processor that sets or updates the taxonomies attribute from attributes.
    # Currently we are using:
    # - the neo4j-versions attribute to set the neo4j_version taxonomy
    # - the tags attribute to set the developer_tag taxonomy
    # - the category attribute to set the developer_category taxonomy
    # - the environment attribute to set the developer_environment taxonomy
    #
    class Neo4jTaxonomiesTreeProcessor < Asciidoctor::Extensions::TreeProcessor
      use_dsl

      def slugify(values)
        values.map do |v|
          v.downcase
              .strip
              .gsub('.', '-')
              .gsub(' ', '-')
              .gsub(/[^\w-]/, '')
        end
      end

      def process(document)
        taxonomies = []
        if document.attr?('taxonomies')
          taxonomies << document.attr('taxonomies')
        end
        if (tags = document.attr('tags')) && !tags.strip.empty?
          taxonomies << "developer_tag=#{slugify(tags.split(',')).join(';')}"
        end
        if (environment = document.attr('environment')) && !environment.strip.empty?
          taxonomies << "environment=#{slugify(environment.split(',')).join(';')}"
        end
        if (category = document.attr('category')) && !category.strip.empty?
          taxonomies << "developer_category=#{slugify(category.split(',')).join(';')}"
        end
        if (neo4j_versions = document.attr('neo4j-versions')) && !neo4j_versions.strip.empty?
          taxonomies << "neo4j_version=#{slugify(neo4j_versions.split(',')).join(';')}"
        end
        document.set_attribute 'taxonomies', taxonomies.join(',')
        document
      end
    end
  end
end

Asciidoctor::Extensions.register do
  tree_processor Neo4j::AsciidoctorExtensions::Neo4jTaxonomiesTreeProcessor
end