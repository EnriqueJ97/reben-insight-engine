import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MemoizedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const MemoizedCard = memo<MemoizedCardProps>(({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  onClick,
  hoverable = false
}) => {
  return (
    <Card 
      className={cn(
        hoverable && 'transition-all duration-200 hover:shadow-lg cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard'; 