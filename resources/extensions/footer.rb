# frozen_string_literal: true

require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'

module Neo4j
  # Asciidoctor extensions by Neo4j
  module AsciidoctorExtensions

    # A preprocessor that adds a footer.
    #
    class FooterPreprocessor < Asciidoctor::Extensions::Preprocessor
      use_dsl

      FOOTER_LINES = File.readlines(File.join(File.dirname(__FILE__), 'footer_text.adoc')).map(&:chomp)

       def process(document, reader)
         lines = reader.lines
         lines.push(*FOOTER_LINES)
         Asciidoctor::Reader.new lines
      end
    end
  end
end

Asciidoctor::Extensions.register do
  preprocessor Neo4j::AsciidoctorExtensions::FooterPreprocessor
end