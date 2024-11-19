/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ExceptionsListPreMultiListFindServerExtension } from '@kbn/lists-plugin/server';
import { stringify } from '../../../endpoint/utils/stringify';
import type { EndpointAppContextService } from '../../../endpoint/endpoint_app_context_services';
import {
  BlocklistValidator,
  EndpointExceptionsValidator,
  EventFilterValidator,
  HostIsolationExceptionsValidator,
  TrustedAppValidator,
} from '../validators';

type ValidatorCallback = ExceptionsListPreMultiListFindServerExtension['callback'];
export const getExceptionsPreMultiListFindHandler = (
  endpointAppContextService: EndpointAppContextService
): ValidatorCallback => {
  const logger = endpointAppContextService.createLogger('listsPluginPreListFind');
  const fleetServices = endpointAppContextService.getInternalFleetServices();

  return async function ({ data, context: { request } }) {
    if (!data.namespaceType.includes('agnostic')) {
      return data;
    }

    logger.debug(
      () => `Pre-Multi-list-find with data:
${stringify(data)}`
    );

    const spaceId = endpointAppContextService.getSpaceId(request);
    const soScopedClient = fleetServices.savedObjects.createInternalScopedSoClient({ spaceId }); // need to get space id
    const { items: allEndpointPolicyIds } = await fleetServices.packagePolicy.listIds(
      soScopedClient,
      {
        kuery: fleetServices.endpointPolicyKuery,
      }
    );

    // Append filter that only returns back content for Fleet policies that are visible in the  current space
    const spaceVisibleDataFilter = `(exception-list-agnostic.attributes.tags:"policy:all" OR ${allEndpointPolicyIds
      .map((policyId) => `exception-list-agnostic.attributes.tags:"policy:${policyId}"`)
      .join(' OR ')})`;

    if (data.filter) {
      data.filter[0] = spaceVisibleDataFilter + (data.filter[0] ? ` AND (${data.filter[0]})` : '');
    } else {
      data.filter = [spaceVisibleDataFilter];
    }

    logger.debug(`Filter adjusted to:\n${data.filter[0]}`);

    // validate Trusted application
    if (data.listId.some((id) => TrustedAppValidator.isTrustedApp({ listId: id }))) {
      await new TrustedAppValidator(endpointAppContextService, request).validatePreMultiListFind();
      return data;
    }

    // Validate Host Isolation Exceptions
    if (
      data.listId.some((listId) =>
        HostIsolationExceptionsValidator.isHostIsolationException({ listId })
      )
    ) {
      await new HostIsolationExceptionsValidator(
        endpointAppContextService,
        request
      ).validatePreMultiListFind();
      return data;
    }

    // Event Filters Exceptions
    if (data.listId.some((listId) => EventFilterValidator.isEventFilter({ listId }))) {
      await new EventFilterValidator(endpointAppContextService, request).validatePreMultiListFind();
      return data;
    }

    // validate Blocklist
    if (data.listId.some((id) => BlocklistValidator.isBlocklist({ listId: id }))) {
      await new BlocklistValidator(endpointAppContextService, request).validatePreMultiListFind();
      return data;
    }

    // Validate Endpoint Exceptions
    if (data.listId.some((id) => EndpointExceptionsValidator.isEndpointException({ listId: id }))) {
      await new EndpointExceptionsValidator(
        endpointAppContextService,
        request
      ).validatePreMultiListFind();
      return data;
    }

    return data;
  };
};
