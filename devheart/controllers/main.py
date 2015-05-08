#-*- coding: utf-8 -*-

import werkzeug

from  openerp import SUPERUSER_ID
from openerp.tools.translate import _
from openerp.addons.website.models.website import slug

from openerp.addons.web import http
from openerp.addons.web.http import request

from ..tools import tools
from openerp.tools.translate import _

PPG = 20 # Projects Per Page
PPR = 4  # Projects Per Row
SCOPE = 7


#Controllers handle web requests
class devheart_project(http.Controller):

    @http.route(["/project/<model('project.project'):project>/coordinator/assign",
        ], type='http', auth="public", website="True")
    def coordinator_assign(self, project, **kwargs):
        cr, uid, context, pool = request.cr, request. uid, request.context, request.registry
        if uid:
            vals = {
                    'user_id':uid,
                    'members' : [(4, uid, {})]
                    }
            proj_obj= pool.get("project.project").write(cr, SUPERUSER_ID, project.id, vals,context=context)
            #return werkzeug.utils.redirect("/project/%s" % ( slug(project)))
            return werkzeug.utils.redirect("/web#model=project.project&id="+str(project.id))
        else:
            return login_redirect()

    #TODO: implement using ajax
    @http.route(["/project/<model('project.project'):project>/task/<model('project.task'):task>/assign",
        ], type='http', auth="public", website="True")
    def task_assign(self, project, task, **kwargs):
        cr, uid, context, pool = request.cr, request. uid, request.context, request.registry
        if uid:
            #update task stage: wip
            status_wip = pool.get('ir.model.data').get_object(
                    cr,
                    uid,
                    'devheart',
                    'project_task_type_wip'
                )
            task_obj= pool.get("project.task").write(cr, uid, task.id,
                    {'user_id':uid,
                        'stage_id': status_wip.id,
                        },
                    context=context)
            # add user to project team
            vals = {
                    'members' : [(4, uid, {})]
                    }
            proj_obj= pool.get("project.project").write(cr, SUPERUSER_ID, task.project_id.id, vals,context=context)
            #return werkzeug.utils.redirect("/project/%s" % ( slug(project)))
            return werkzeug.utils.redirect("/web#model=project.task&id="+str(task.id))
        else:
            return login_redirect()


    @http.route(['/project/new',
        ], type="http", auth="user", website="True")
    def newproject(self, s_action=None, **kwargs):

        cr, uid, context, pool = request.cr, request. uid, request.context, request.registry
        proxy = pool['project.project']
        new_id =proxy.create(cr, uid, {'name':_('Titre')}, context=context)
        new_project = proxy.browse(cr, uid, [new_id],context=context)

        return werkzeug.utils.redirect("/project/%s?enable_editor=1" % ( slug(new_project)))

    @http.route(['/my-projects',
        ], type="http", auth="user", website="True")
    def myprojects(self, s_action=None, **kwargs):

        cr, uid, context, pool = request.cr, request. uid, request.context, request.registry
        proxy = pool['project.project']
        ids =proxy.search(cr, uid, [('create_uid','=',uid)],context=context)
        myprojects = proxy.browse(cr, uid, ids,context=context)

        return request.render('devheart.myprojects', qcontext={'projects': myprojects})
        '''
                if request.session.uid:
                    if kwargs.get('redirect'):
                        return werkzeug.utils.redirect(kw.get('redirect'), 303)
                    if not request.uid:
                        request.uid = request.session.uid

                    cr, uid, context, pool = request.cr, request. uid, request.context, request.registry
                    myprojects = pool['project.project'].browse(cr, uid, [uid],context=context)

                    return request.render('devheart.myprojects', qcontext={'projects': myprojects})
                else:
                    return login_redirect()
        '''

    #page about us
    @http.route([
        '/about',
        ], type='http', auth='public', website=True)
    def about(self, page=0, search='' ):
        return request.website.render('devheart.about')

    #page contact us
    @http.route([
        '/contactus',
        ], type='http', auth='public', website=True)
    def contactus(self, page=0, search='' ):
        return request.website.render('website.contactus')

    @http.route([
        '/project/<model("project.project"):project>',
        ], type='http', auth='public', website=True)
    def project(self, page=0, project=None,  search='', **post):
        cr, context, pool = request.cr, request.context, request.registry
        uid = SUPERUSER_ID

        keep = tools.QueryURL(path='/project',
            project=project,
            search=search )

        #we need to fetch the model ourselves instead of just passing over the model arg because of access issues with publics users
        project_obj = pool.get("project.project").browse(cr, uid, [project.id], context=context)
        values = {

            'search' : search,
            'project' : project_obj,
            'main_object': project,
            }
        return request.website.render('devheart.project-single',values)


    @http.route(['/projects',
        '/project/',
        '/projects/page/<int:page>',
        '/projects/addressed_issue/<model("project.addressed.issues"):addressed_issue>',
        '/projects/addressed_issue/<model("project.addressed.issues"):addressed_issue>/page/<int:page>',
        '/projects/skill/<model("project.category"):skill>',
        '/projects/skill/<model("project.category"):skill>/page/<int:page>',
        ], type='http', auth='public', website=True)
    def projects(self, page=0,  addressed_issue=None, skill=None, search='', **post):
        cr, context, pool = request.cr, request.context, request.registry
        uid = SUPERUSER_ID
        #TODO: fetch project initial domain
        #domain = request.website.sale_product_domain()
        domain = []
        #we only fetch public projects
        domain += [('privacy_visibility', '=', 'public')]
        if search:
            domain += [ ('name', 'ilike', search) ]
        if addressed_issue:
            domain +=  [('addressed_issues', 'in', addressed_issue.id) ]
        if skill:
            domain +=  [('skills', 'in', skill.id) ]

        keep = tools.QueryURL(path='/project',
           # project=project,
            addressed_issue=addressed_issue and int(addressed_issue),
            skill=skill and int(skill),
            search=search )

        project_obj = pool.get("project.project")

        project_count = project_obj.search_count(cr, uid, domain, context=context)
        pager = request.website.pager(url="/project", total=project_count, page=page, step=PPG, scope=SCOPE, url_args=post)
        project_ids = project_obj.search(cr, uid, domain, limit=PPG+10, offset=pager['offset'], order='sequence desc', context=context)
        projects = project_obj.browse(cr, uid, project_ids, context=context)

        adressed_issues_by_project = {}
        skills_by_project = {}
        for project in projects :
            tags = ' '
            for ai in project.addressed_issues:
                 tags+= "%s " % (ai.name)
            adressed_issues_by_project.setdefault(project.id,tags)

            tags = ''
            for skill in project.skills:
                tags+= " %s" % (skill.name)
            skills_by_project.setdefault(project.id, tags)

        #get all addressed issues
        addressed_issue_obj = pool.get("project.addressed.issues")
        addressed_issue_ids = addressed_issue_obj.search(cr, uid, [], context=context)
        addressed_issues =  addressed_issue_obj.browse(cr, uid, addressed_issue_ids, context=context)

        #get all skills
        skill_obj = pool.get("project.category")
        skill_ids = skill_obj.search(cr, uid, [], context=context)
        skills = skill_obj.browse(cr, uid, skill_ids, context=context)
        values = {

            'search' : search,
            'pager' : pager,
            'projects' : projects,
            'keep' : keep,
            'addressed_issues' : addressed_issues,
            'skills' : skills,
            'adressed_issues_by_project' : adressed_issues_by_project,
            'skills_by_project' : skills_by_project,
            }

        view_obj = request.registry["ir.ui.view"]
        toto = view_obj.render(
            request.cr, uid, 'devheart.portfolio', values,
            context=request.context)
        return toto
        #return request.website.render('devheart.portfolio',values)








