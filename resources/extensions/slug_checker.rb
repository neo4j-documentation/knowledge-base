# frozen_string_literal: true

require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'

module Neo4j
  # Asciidoctor extensions by Neo4j
  module AsciidoctorExtensions

    # A tree processor that checks if the slug attribute is valid (otherwise fails).
    #
    class SlugCheckerTreeProcessor < Asciidoctor::Extensions::TreeProcessor
      use_dsl

      def process(document)
        if (slug = document.attr('slug'))
          raise ArgumentError, "The slug attribute is invalid: '#{slug}', it must only contains lowercase alphanumeric characters and hyphens, aborting." unless slug =~ /^[a-z0-9-]+$/
        end
        document
      end
    end
  end
end

Asciidoctor::Extensions.register do
  tree_processor Neo4j::AsciidoctorExtensions::SlugCheckerTreeProcessor
end