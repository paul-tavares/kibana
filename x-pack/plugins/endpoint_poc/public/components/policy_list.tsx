/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { EuiBasicTable, EuiTableCriteria, EuiLink } from '@elastic/eui';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { selectIsFetching, selectList } from '../selectors/policy_list';

interface IConnectedEuiLinkProps extends RouteComponentProps {
  path: string;
  title: string;
}

const ConnectedEuiLink = withRouter<
  IConnectedEuiLinkProps,
  React.FunctionComponent<IConnectedEuiLinkProps>
>(({ title, path, history }) => {
  return <EuiLink onClick={() => history.push(path)}>{title}</EuiLink>;
});

const columns = [
  {
    field: 'name',
    name: 'Name',
    render: (name: string, item: { id: string }) => {
      return <ConnectedEuiLink title={name} path={`/policies/view/${item.id}`} />;
    },
  },
  {
    field: 'id',
    name: 'ID',
  },
  {
    field: 'package.version',
    name: 'Version',
  },
];

export const PolicyList = React.memo(() => {
  const tableItemList = useSelector(selectList);
  const isFetching = useSelector(selectIsFetching);
  const paginationSetup = {
    pageIndex: 0,
    pageSize: 20,
    totalItemCount: 0,
    pageSizeOptions: [5, 10, 20],
    hidePerPageOptions: false,
  };
  const sortingSetup: { sort: EuiTableCriteria['sort'] } = {
    sort: {
      field: 'name',
      direction: 'asc',
    },
  };
  const handleTableChange = () => {};

  return (
    <EuiBasicTable
      items={tableItemList}
      columns={columns}
      loading={isFetching}
      pagination={paginationSetup}
      sorting={sortingSetup}
      onChange={handleTableChange}
    />
  );
});
