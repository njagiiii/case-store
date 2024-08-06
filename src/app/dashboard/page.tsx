import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'


const DashboardPage = async () => {
    // secure dashboard
    const {getUser} = getKindeServerSession()
    const user =await getUser()

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL

    // check for regular user and admin
    if(!user || user.email !== ADMIN_EMAIL){
        return notFound()
    }

    // show orders on dashboard
    const orders = await db.order.findMany({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date(). setDate(new Date().getDate() - 7))
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: true,
            shippingAddress:true
        }

    })

    // grab money made lastweek
    const lastWeekSum = await db.order.aggregate({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date(). setDate(new Date().getDate() - 7))
            }
        },
        _sum : {
            amount: true
        }

    })
// last month sum
    const lastMonthSum = await db.order.aggregate({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date(). setDate(new Date().getDate() - 30))
            }
        },
        _sum : {
            amount: true
        }

    })
    const WEEKLY_GOAL = 65000
    const MONTHLY_GOAL = 32000
  return <div className="flex min-h-screen w-full bg-muted/40">
    <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4">
        <div className="flex flex-col gap-16">
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>Last Week</CardDescription>
                        <CardTitle className='text-4xl'>{formatPrice(lastWeekSum._sum.amount ?? 0)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            of {formatPrice(WEEKLY_GOAL)}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Progress value={((lastWeekSum._sum.amount ?? 0) / WEEKLY_GOAL) * 100 }/>
                    </CardFooter>
                </Card>
                {/* last month */}
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>Last Month</CardDescription>
                        <CardTitle className='text-4xl'>{formatPrice(lastMonthSum._sum.amount ?? 0)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            of {formatPrice(MONTHLY_GOAL)}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Progress value={((lastMonthSum._sum.amount ?? 0) / MONTHLY_GOAL) * 100 }/>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  </div>
}

export default DashboardPage