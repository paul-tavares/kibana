/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export type { TagsCapabilities } from './capabilities';
export { getTagsCapabilities } from './capabilities';
export { tagFeatureId, tagSavedObjectTypeName, tagManagementSectionId } from './constants';
export type { TagValidation } from './validation';
export {
  validateTagColor,
  validateTagName,
  validateTagDescription,
  tagNameMinLength,
  tagNameMaxLength,
  tagDescriptionMaxLength,
} from './validation';
export {
  convertTagNameToId,
  getObjectTags,
  getTag,
  getTagIdsFromReferences,
  getTagsFromReferences,
  replaceTagReferences,
  tagIdToReference,
} from './references';
