# frozen_string_literal: true

require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'

module Neo4j
  # Asciidoctor extensions by Neo4j
  module AsciidoctorExtensions

    # A tree processor that sets the Zendesk publishing targets (Zendesk URL + sections) from attributes.
    #
    class Neo4jZendeskPublishingTargetsTreeProcessor < Asciidoctor::Extensions::TreeProcessor
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
        zendesk_publishing_targets = []
        if document.attr?('zendesk_publishing_targets')
          zendesk_publishing_targets << document.attr('zendesk_publishing_targets')
        end
        if (aura = document.attr('aura'))
          if aura.strip.empty?
            zendesk_publishing_targets << "aura=help-center/knowledge-base"
          else
            zendesk_publishing_targets << "aura=#{slugify(aura.split(',')).join(';')}"
          end
        end
        if (enterprise = document.attr('enterprise'))
          if enterprise.strip.empty?
            zendesk_publishing_targets << "enterprise=help-center/knowledge-base"
          else
            zendesk_publishing_targets << "enterprise=#{slugify(enterprise.split(',')).join(';')}"
          end
        end
        document.set_attribute 'zendesk_publishing_targets', zendesk_publishing_targets.join(',')
        document
      end
    end
  end
end

Asciidoctor::Extensions.register do
  tree_processor Neo4j::AsciidoctorExtensions::Neo4jZendeskPublishingTargetsTreeProcessor
end