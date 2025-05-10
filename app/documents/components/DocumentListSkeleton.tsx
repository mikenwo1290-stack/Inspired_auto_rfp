import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DocumentListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Skeleton className="h-10 w-full sm:w-96" />
        <Skeleton className="h-10 w-full sm:w-64" />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-4 w-32 mr-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-end mt-2">
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 