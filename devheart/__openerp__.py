# -*- coding: utf-8 -*-
{
    'name': "developpeursducoeur",
    'version': '1.0',
    'category': 'Dev du coeur' ,
    'sequence': 5,
    'summary': "developpeursducoeur ",
    'description': """
""",
    'author': 'Yassine El Ghali',
    'website': 'http://developpeursducoeur.org',
    'depends': [
        'base',
        'web',
        'crm',
        'project',
        'website',
        'website_project',
        'website_crm',
        'website_blog',
        'website_forum',
        'note_pad',
        'pad',
        'pad_project',
        'document',
        'google_drive',
        'oe_git_integration',
    ],
    'data': [
        #data
        'data/website_menu.xml',
        'data/res_groups.xml',
        'data/res_company.xml',
        'data/project.xml',
        # Views
        'views/project.xml',
        'views/user.xml',
        # Templates
        'templates/layout.xml',
        'templates/header.xml',
        'templates/footer.xml',
        'templates/portfolio.xml',
        'templates/project-single.xml',
        'templates/team_member.xml',
        'templates/our_team.xml',
        'templates/contact.xml',
        'templates/about.xml',

        # Menus
        'views/menus.xml',

        # Security
        'security/ir.model.access.csv',
    ],
    'demo': [
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
