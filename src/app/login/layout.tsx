import React, { Suspense } from 'react';

const LoginPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense>{children}</Suspense>;
};

export default LoginPageLayout;
