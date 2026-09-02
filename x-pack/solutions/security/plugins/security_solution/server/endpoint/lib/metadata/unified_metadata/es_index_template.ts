/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { deepFreeze } from '@kbn/std';
import type { IndicesIndexTemplateSummaryWithRollover } from '@elastic/elasticsearch/api/types';

/**
 * Index name that will be used to store unified endpoint ++ agent metadata
 *
 * FIXME: need perhaps better index name. Just using this one because its a pattern already allowed by kibana_system user
 */
export const UNIFIED_METADATA_INDEX_NAME = '.metrics-endpoint.metadata_united_default-unified';

export const INDEX_TEMPLATE = deepFreeze<IndicesIndexTemplateSummaryWithRollover>({
  aliases: {},
  mappings: {
    dynamic: false,
    _meta: {
      created_by: 'Security Solution EDR',
      internal: true,
      managed: true,
    },
    dynamic_templates: [
      {
        strings_as_keyword: {
          match_mapping_type: 'string',
          mapping: {
            ignore_above: 1024,
            type: 'keyword',
          },
        },
      },
    ],
    date_detection: false,
    properties: {
      updated_at: {
        type: 'date',
      },
      agent: {
        properties: {
          id: {
            type: 'keyword',
          },
        },
      },
      united: {
        properties: {
          agent: {
            properties: {
              access_api_key_id: {
                type: 'keyword',
              },
              action_seq_no: {
                type: 'integer',
                index: false,
              },
              active: {
                type: 'boolean',
              },
              agent: {
                properties: {
                  id: {
                    type: 'keyword',
                  },
                  version: {
                    type: 'keyword',
                  },
                },
              },
              audit_unenrolled_reason: {
                type: 'keyword',
              },
              audit_unenrolled_time: {
                type: 'date',
              },
              components: {
                type: 'object',
                enabled: false,
              },
              default_api_key: {
                type: 'keyword',
              },
              default_api_key_id: {
                type: 'keyword',
              },
              enrolled_at: {
                type: 'date',
              },
              last_checkin: {
                type: 'date',
              },
              last_checkin_message: {
                type: 'text',
                index: false,
              },
              last_checkin_status: {
                type: 'keyword',
              },
              last_updated: {
                type: 'date',
              },
              local_metadata: {
                properties: {
                  elastic: {
                    properties: {
                      agent: {
                        properties: {
                          build: {
                            properties: {
                              original: {
                                type: 'text',
                                fields: {
                                  keyword: {
                                    type: 'keyword',
                                    ignore_above: 256,
                                  },
                                },
                              },
                            },
                          },
                          id: {
                            type: 'keyword',
                          },
                          log_level: {
                            type: 'keyword',
                          },
                          snapshot: {
                            type: 'boolean',
                          },
                          upgradeable: {
                            type: 'boolean',
                          },
                          version: {
                            type: 'text',
                            fields: {
                              keyword: {
                                type: 'keyword',
                                ignore_above: 16,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  host: {
                    properties: {
                      architecture: {
                        type: 'keyword',
                      },
                      hostname: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                          },
                        },
                      },
                      id: {
                        type: 'keyword',
                      },
                      ip: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 64,
                          },
                        },
                      },
                      mac: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 17,
                          },
                        },
                      },
                      name: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                          },
                        },
                      },
                    },
                  },
                  os: {
                    properties: {
                      family: {
                        type: 'keyword',
                      },
                      full: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 128,
                          },
                        },
                      },
                      kernel: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 128,
                          },
                        },
                      },
                      name: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                          },
                        },
                      },
                      platform: {
                        type: 'keyword',
                      },
                      version: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            ignore_above: 32,
                          },
                        },
                      },
                    },
                  },
                },
              },
              namespaces: {
                type: 'keyword',
              },
              packages: {
                type: 'keyword',
              },
              policy_coordinator_idx: {
                type: 'integer',
              },
              policy_id: {
                type: 'keyword',
              },
              policy_output_permissions_hash: {
                type: 'keyword',
              },
              policy_revision_idx: {
                type: 'integer',
              },
              shared_id: {
                type: 'keyword',
              },
              type: {
                type: 'keyword',
              },
              unenrolled_at: {
                type: 'date',
              },
              unenrolled_reason: {
                type: 'keyword',
              },
              unenrollment_started_at: {
                type: 'date',
              },
              updated_at: {
                type: 'date',
              },
              upgrade_started_at: {
                type: 'date',
              },
              upgraded_at: {
                type: 'date',
              },
              user_provided_metadata: {
                type: 'object',
                enabled: false,
              },
            },
          },
          endpoint: {
            properties: {
              '@timestamp': {
                type: 'date',
              },
              Endpoint: {
                properties: {
                  capabilities: {
                    type: 'keyword',
                    doc_values: false,
                    ignore_above: 128,
                  },
                  configuration: {
                    properties: {
                      isolation: {
                        type: 'boolean',
                        null_value: false,
                      },
                    },
                  },
                  policy: {
                    properties: {
                      applied: {
                        properties: {
                          id: {
                            type: 'keyword',
                            ignore_above: 1024,
                          },
                          name: {
                            type: 'keyword',
                            ignore_above: 1024,
                          },
                          status: {
                            type: 'keyword',
                            ignore_above: 1024,
                          },
                        },
                      },
                    },
                  },
                  state: {
                    properties: {
                      isolation: {
                        type: 'boolean',
                        null_value: false,
                      },
                      orphaned: {
                        type: 'boolean',
                        null_value: false,
                      },
                      tamper_protection: {
                        type: 'boolean',
                        null_value: false,
                      },
                    },
                  },
                  status: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                },
              },
              agent: {
                properties: {
                  id: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  name: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  type: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  version: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                },
              },
              data_stream: {
                properties: {
                  dataset: {
                    type: 'constant_keyword',
                    value: 'endpoint.metadata',
                  },
                  namespace: {
                    type: 'keyword',
                  },
                  type: {
                    type: 'constant_keyword',
                    value: 'metrics',
                  },
                },
              },
              ecs: {
                properties: {
                  version: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                },
              },
              elastic: {
                properties: {
                  agent: {
                    properties: {
                      id: {
                        type: 'keyword',
                        ignore_above: 1024,
                      },
                    },
                  },
                },
              },
              event: {
                properties: {
                  action: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  category: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  code: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  created: {
                    type: 'date',
                  },
                  dataset: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  hash: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  id: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  ingested: {
                    type: 'date',
                  },
                  kind: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  module: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  outcome: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  provider: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  sequence: {
                    type: 'long',
                  },
                  severity: {
                    type: 'long',
                  },
                  type: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                },
              },
              host: {
                properties: {
                  architecture: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  domain: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  hostname: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  id: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  ip: {
                    type: 'ip',
                  },
                  mac: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  name: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  os: {
                    properties: {
                      Ext: {
                        properties: {
                          variant: {
                            type: 'keyword',
                            ignore_above: 1024,
                          },
                        },
                      },
                      family: {
                        type: 'keyword',
                        ignore_above: 1024,
                      },
                      full: {
                        type: 'keyword',
                        ignore_above: 1024,
                      },
                      kernel: {
                        type: 'keyword',
                        ignore_above: 1024,
                      },
                      name: {
                        type: 'keyword',
                        ignore_above: 1024,
                      },
                      platform: {
                        type: 'keyword',
                        ignore_above: 1024,
                      },
                      version: {
                        type: 'keyword',
                        ignore_above: 1024,
                      },
                    },
                  },
                  type: {
                    type: 'keyword',
                    ignore_above: 1024,
                  },
                  uptime: {
                    type: 'long',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  settings: {
    index: {
      codec: 'best_compression',
      routing: {
        allocation: {
          include: {
            _tier_preference: 'data_content',
          },
        },
      },
      refresh_interval: '5s',
      hidden: 'true',
      number_of_shards: '1',
      auto_expand_replicas: '0-1',
      number_of_replicas: '0',
    },
  },
});
